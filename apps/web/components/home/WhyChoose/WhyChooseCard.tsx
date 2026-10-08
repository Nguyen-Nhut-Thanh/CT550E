type WhyChooseCardProps = {
  title: string;
  description: string;
  icon: string;
  rotate?: string;
};

export default function WhyChooseCard({
  title,
  description,
  icon,
  rotate = "",
}: WhyChooseCardProps) {
  return (
    <div className="flex flex-col items-center space-y-4 text-center">
      <div className="relative flex h-24 w-24 items-center justify-center">
        <img
          src={icon}
          alt={title}
          className={`h-16 w-16 object-contain ${rotate} transition-transform duration-300 hover:scale-110`}
          loading="lazy"
        />
      </div>

      <h3 className="text-xl font-bold text-[#1a2b48]">{title}</h3>

      <p className="max-w-xs text-sm leading-relaxed text-gray-500">
        {description}
      </p>
    </div>
  );
}
