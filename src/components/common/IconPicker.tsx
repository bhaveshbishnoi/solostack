import React, { useState } from 'react';
import {
  Table,
  Database,
  FileText,
  Bookmark,
  Tag,
  Star,
  Car,
  Hotel,
  GraduationCap,
  BookOpen,
  BadgeDollarSign,
  Dumbbell,
  Activity,
  Store,
  Truck,
  Stethoscope,
  Briefcase,
  Factory,
  Utensils,
  Home,
  Wrench,
  Sparkles,
  Calendar,
  Users,
  Wallet,
  Key,
  Shield,
  Clock,
  Coins,
  Package,
  Heart,
  CheckSquare,
  Search
} from 'lucide-react';

export const ICON_REGISTRY: Record<string, React.ElementType> = {
  table: Table,
  database: Database,
  file: FileText,
  bookmark: Bookmark,
  tag: Tag,
  star: Star,
  car: Car,
  hotel: Hotel,
  school: GraduationCap,
  book: BookOpen,
  payroll: BadgeDollarSign,
  gym: Dumbbell,
  hospital: Activity,
  store: Store,
  truck: Truck,
  pharmacy: Stethoscope,
  briefcase: Briefcase,
  factory: Factory,
  restaurant: Utensils,
  home: Home,
  wrench: Wrench,
  sparkles: Sparkles,
  calendar: Calendar,
  users: Users,
  wallet: Wallet,
  key: Key,
  shield: Shield,
  clock: Clock,
  coins: Coins,
  package: Package,
  heart: Heart,
  check: CheckSquare,
};

export function getIconComponent(iconName?: string): React.ElementType {
  if (!iconName) return Table;
  return ICON_REGISTRY[iconName.toLowerCase()] || Table;
}

interface IconPickerProps {
  selectedIcon: string;
  onSelectIcon: (iconName: string) => void;
}

export const IconPicker: React.FC<IconPickerProps> = ({ selectedIcon, onSelectIcon }) => {
  const [search, setSearch] = useState('');

  const iconKeys = Object.keys(ICON_REGISTRY);
  const filtered = iconKeys.filter((k) => k.toLowerCase().includes(search.toLowerCase()));

  const SelectedIconComponent = getIconComponent(selectedIcon);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-foreground">Table Icon</label>
        <div className="flex items-center gap-1.5 text-xs text-primary font-bold">
          <SelectedIconComponent className="h-4 w-4" />
          <span className="capitalize">{selectedIcon || 'table'}</span>
        </div>
      </div>

      <div className="p-3 bg-muted/20 border border-border rounded-xl space-y-2">
        <div className="relative">
          <Search className="h-3 w-3 absolute left-2.5 top-2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search icons (e.g. car, hotel, star, book)..."
            className="w-full pl-7 pr-3 py-1 bg-muted/40 border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary"
          />
        </div>

        <div className="grid grid-cols-8 sm:grid-cols-11 gap-1.5 max-h-32 overflow-y-auto p-1">
          {filtered.map((key) => {
            const Icon = ICON_REGISTRY[key];
            const isSelected = (selectedIcon || 'table').toLowerCase() === key.toLowerCase();

            return (
              <button
                type="button"
                key={key}
                onClick={() => onSelectIcon(key)}
                className={`p-2 rounded-lg flex items-center justify-center transition ${
                  isSelected
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
                }`}
                title={key}
              >
                <Icon className="h-4 w-4" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
