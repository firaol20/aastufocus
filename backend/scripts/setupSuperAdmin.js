import mongoose from "mongoose";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import connectDB from "../config/database.js";
import User from "../models/User.js";
import { validatePasswordStrength } from "../utils/passwordUtils.js";

const askRequired = async (rl, promptText) => {
  while (true) {
    const answer = (await rl.question(promptText)).trim();
    if (answer) {
      return answer;
    }

    console.log("This field is required.");
  }
};

const askYesNo = async (rl, promptText, defaultValue = "y") => {
  const normalizedDefault = defaultValue.toLowerCase() === "n" ? "n" : "y";

  while (true) {
    const answer = (
      await rl.question(
        `${promptText} [${normalizedDefault === "y" ? "Y/n" : "y/N"}]: `,
      )
    )
      .trim()
      .toLowerCase();

    if (!answer) {
      return normalizedDefault === "y";
    }

    if (["y", "yes"].includes(answer)) {
      return true;
    }

    if (["n", "no"].includes(answer)) {
      return false;
    }

    console.log("Please answer with y or n.");
  }
};

const askForValidPassword = async (rl) => {
  while (true) {
    const password = await askRequired(rl, "Password: ");
    const confirmPassword = await askRequired(rl, "Confirm password: ");

    if (password !== confirmPassword) {
      console.log("Passwords do not match. Try again.");
      continue;
    }

    const validation = validatePasswordStrength(password);
    if (!validation.isValid) {
      console.log(`Invalid password: ${validation.errors.join("; ")}`);
      continue;
    }

    return password;
  }
};

const printIntro = () => {
  console.log("Super Admin Setup");
  console.log(
    "This script creates a new admin user or promotes an existing user to admin.",
  );
  console.log("");
};

const run = async () => {
  const rl = createInterface({ input, output });

  printIntro();

  const email = (await askRequired(rl, "Admin email: ")).toLowerCase();

  try {
    await connectDB();

    const existing = await User.findOne({ email }).select("+password");

    if (existing) {
      console.log(`User found: ${existing.name} <${existing.email}>`);

      const shouldPromote = await askYesNo(
        rl,
        "Promote this user to admin and activate the account?",
        "y",
      );

      if (!shouldPromote) {
        console.log("Setup cancelled.");
        return;
      }

      existing.role = "admin";
      existing.isActive = true;

      const shouldResetPassword = await askYesNo(
        rl,
        "Do you want to set a new password for this user?",
        "n",
      );

      if (shouldResetPassword) {
        const password = await askForValidPassword(rl);
        existing.password = password;
      }

      await existing.save();
      console.log(`Success: ${email} is now an admin.`);
      return;
    }

    const name = await askRequired(rl, "Full name: ");
    const password = await askForValidPassword(rl);

    await User.create({
      name,
      email,
      password,
      role: "admin",
      isActive: true,
    });

    console.log(`Success: created admin user ${email}.`);
  } finally {
    rl.close();
    await mongoose.connection.close();
  }
};

run().catch((error) => {
  console.error("Failed to set up super admin:", error.message);
  process.exit(1);
});
