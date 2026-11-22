
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const allowedSubjects = [
  "General enquiry",
  "Technical support",
  "Trainer application",
  "Gym partnership",
  "Feedback or suggestions",
  "Other",
];

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const subject = String(body.subject || "").trim();
    const message = String(body.message || "").trim();

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Please complete all fields." },
        { status: 400 }
      );
    }

    // Validate input lengths
    if (
      name.length > 100 ||
      email.length > 254 ||
      message.length > 5000
    ) {
      return NextResponse.json(
        { error: "One or more fields exceed the allowed length." },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // Validate subject
    if (!allowedSubjects.includes(subject)) {
      return NextResponse.json(
        { error: "Please select a valid subject." },
        { status: 400 }
      );
    }

    const recipient = process.env.CONTACT_EMAIL;

    if (!process.env.RESEND_API_KEY || !recipient) {
      console.error("Contact email environment variables are missing.");

      return NextResponse.json(
        { error: "Contact service is currently unavailable." },
        { status: 500 }
      );
    }

    const { error } = await resend.emails.send({
      from: "FitX Lanka <onboarding@resend.dev>",
      to: [recipient],
      replyTo: email,
      subject: `FitX Lanka Contact: ${subject}`,
      text: `
New contact enquiry received.

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}
      `,
    });

    if (error) {
      console.error("Resend error:", error);

      return NextResponse.json(
        { error: "Unable to send your message. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Your message has been sent successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact API error:", error);

    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
