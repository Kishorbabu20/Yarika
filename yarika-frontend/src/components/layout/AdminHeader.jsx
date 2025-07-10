import { useState } from 'react';
import { Bell, Search, User, Plus } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

const AdminHeader = ({ title, onAdd }) => {
  const [searchValue, setSearchValue] = useState('');

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      {/* Left - Page Title */}
      <h1 className="text-yarika-charcoal font-heading font-bold text-2xl">{title}</h1>

      {/* Right - Controls */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search products, orders..."
            className="pl-10 rounded-2xl border-gray-200 focus:border-yarika-gold focus:ring-yarika-gold"
          />
        </div>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-2xl"
            >
              <div className="w-8 h-8 bg-yarika-gold rounded-full flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              <span className="text-sm font-medium text-yarika-charcoal">Admin</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 mt-2 rounded-2xl border-gray-200">
            <DropdownMenuItem className="rounded-xl">Profile Settings</DropdownMenuItem>
            <DropdownMenuItem className="rounded-xl">Account Settings</DropdownMenuItem>
            <DropdownMenuItem className="rounded-xl text-red-600">Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default AdminHeader;
