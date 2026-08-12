import crypto from "crypto";

export const generateVerificationToken = () => {
  const unhashedToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(unhashedToken)
    .digest("hex");

  return { unhashedToken, hashedToken };
};

export const sendVerificationEmail = async ({ email, unhashedToken, clientUrl }) => {
  const baseUrl = clientUrl || process.env.CLIENT_URL || "http://localhost:5173";
  const verificationUrl = `${baseUrl}/verify-email?token=${unhashedToken}`;

  console.log("\n======================================================");
  console.log(`✉️  EMAIL VERIFICATION LINK FOR: ${email}`);
  console.log(`👉 ${verificationUrl}`);
  console.log("======================================================\n");

  return verificationUrl;
};
