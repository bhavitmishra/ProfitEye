type Props = {
  title: string;
  setF: (value: string) => void;
  type: string;
  placeholder: string;
};

export default function InputBox({ title, setF, type, placeholder }: Props) {
  return (
    <div className="flex flex-col gap-1 w-full">
      <label className="text-sm font-medium text-black">{title}</label>
      <input
        type={type}
        placeholder={placeholder}
        onChange={(e) => setF(e.target.value)}
        className="bg-slate-800 text-white border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full"
      />
    </div>
  );
}
