interface Props {
  message?: string;
}

export default function Loading({ message = "Processing..." }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      <p className="text-gray-600 font-medium">{message}</p>
    </div>
  );
}
