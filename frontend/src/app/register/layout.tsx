"use client"; // Use this if you need client-side interactivity in the layout

const RegisterLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <main className="max-w-lg w-full bg-blue p-6 rounded-lg shadow-md">
        {children}
      </main>
    </div>
  );
};

export default RegisterLayout;