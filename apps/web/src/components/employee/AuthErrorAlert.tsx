export function AuthErrorAlert({ message }: { message: string }) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl" role="alert">
      {message}
    </div>
  );
}
