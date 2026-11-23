type GymWelcomeProps = {
  ownerName: string;
  gymName: string;
};

export default function GymWelcome({
  ownerName,
  gymName,
}: GymWelcomeProps) {
  const firstName = ownerName?.trim().split(" ")[0] || "there";

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#222723] p-6 sm:p-8">
      <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-[#C7F36B]/10 blur-3xl" />

      <div className="relative z-10 max-w-2xl">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#C7F36B]">
          Gym Owner Dashboard
        </p>

        <h2 className="text-2xl font-bold tracking-tight text-[#EFEFE5] sm:text-3xl">
          Welcome back, {firstName}!
        </h2>

        <p className="mt-3 text-sm leading-6 text-white/50 sm:text-base">
          Manage your gym, review booking requests, and keep everything running
          smoothly at {gymName || "your gym"}.
        </p>
      </div>
    </section>
  );
}