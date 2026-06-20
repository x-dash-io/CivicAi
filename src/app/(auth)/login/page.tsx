import { LoginForm } from './LoginForm';

export default function LoginPage() {
  return (
    <div className="w-full">
      {/* Mobile-only Header */}
      <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
        <span className="text-lg font-bold tracking-tight text-[#111827] dark:text-[#FFFFFF]">
          CivicAI
        </span>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-[2rem] font-bold tracking-tight text-[#111827] dark:text-[#FFFFFF] leading-tight">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-[#6B7280] dark:text-[#9CA3AF]">
          Sign in to your CivicAI account
        </p>
      </div>

      <LoginForm />
    </div>
  );
}
