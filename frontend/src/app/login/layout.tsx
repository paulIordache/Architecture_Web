"use client"; // Use this if your layout needs client-side features

const LoginLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <main className="max-w-lg w-full bg-gray-50 dark:bg-gray-900 p-6 rounded-lg shadow-md">
        {children}
      </main>
    </div>
  );
};

export default LoginLayout;