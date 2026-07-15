type ProductPreviewProps = {
  title: string;
  description?: string;
};

const ProductPreview = ({
  title,
  description,
}: ProductPreviewProps) => {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
      {/* Browser Bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface2)]">
        <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
      </div>

      {/* Preview Area */}
      <div className="aspect-video flex flex-col items-center justify-center px-6 text-center">
        <h3 className="text-lg font-semibold text-[var(--color-text)]">
          {title}
        </h3>

        {description && (
          <p className="mt-3 max-w-md text-sm leading-6 text-[var(--color-text-muted)]">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductPreview;