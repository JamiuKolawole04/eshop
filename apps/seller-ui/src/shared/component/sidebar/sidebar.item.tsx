import Link from "next/link";

type Props = {
  title: string;
  icon: React.ReactNode;
  href: string;
  isActive?: boolean;
  needsAttention?: boolean;
};

export const SidebarItem = ({
  title,
  icon,
  href,
  isActive,
  needsAttention = false,
}: Props) => {
  return (
    <Link href={href} className="my-2 block">
      <div
        className={`flex gap-2 w-full min-h-12 h-full items-center px-[13px] rounded-lg cursor-pointer transition hover:bg-[#2b2f31]
          ${isActive && "scale-[.98] bg-[#0f3158] fill-blue-200 hover:!bg-[#0f3158d6]"}`}
      >
        {icon}

        <h5 className="text-slate-200 text-sm">{title}</h5>

        {needsAttention && (
          <span className="ml-auto flex shrink-0 items-center">
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full bg-amber-400 ring-[3px] ring-amber-400/20"
            />
            <span className="sr-only">Needs a connected bank account</span>
          </span>
        )}
      </div>
    </Link>
  );
};
