export default function StatusLegend() {
  const items = [
    { color: "bg-slot-vacant", label: "Vacant" },
    { color: "bg-slot-occupied", label: "Occupied" },
    { color: "bg-slot-reserved", label: "Reserved" },
  ];

  return (
    <div className="flex items-center gap-4">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <span className={`h-3 w-3 rounded-full ${item.color}`} />
          <span className="text-xs text-muted-foreground font-medium">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
