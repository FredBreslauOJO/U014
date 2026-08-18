import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home as HomeIcon,
  Users,
  CalendarDays,
  Building2,
  Newspaper,
  Mail,
  Music2,
  Plus,
  MessagesSquare,
  Briefcase,
  User,
  LogOut,
} from 'lucide-react';
import { supabase } from '@/supabase';
import { useAuth } from '@/lib/AuthContext';
import Logo from '@/components/Logo';
import { bandUrl } from '@/lib/slug';

const navItems = [
  { to: '/', label: 'Início', icon: HomeIcon, end: true },
  { to: '/bands', label: 'Bandas', icon: Music2 },
  { to: '/shows', label: 'Shows', icon: CalendarDays },
  { to: '/venues', label: 'Casas de Shows', icon: Building2 },
  { to: '/partners', label: 'Guia da Cena', icon: Briefcase },
  { to: '/news', label: 'Notícias', icon: Newspaper },
  { to: '/threads', label: 'Threads', icon: MessagesSquare },
  { to: '/contact', label: 'Contato', icon: Mail },
];

export default function Sidebar({ onNavigate }) {
  const navigate = useNavigate();
  const [bands, setBands] = useState([]);
  const { user, signOut } = useAuth();
  const [myBands, setMyBands] = useState([]);

  useEffect(() => {
    supabase
      .from('bands')
      .select('*')
      .order('created_date', { ascending: false })
      .limit(30)
      .then(({ data }) => {
        if (data) setBands(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) {
      setMyBands([]);
      return;
    }
    supabase
      .from('bands')
      .select('*')
      .order('created_date', { ascending: false })
      .limit(200)
      .then(({ data }) => {
        if (data) {
          setMyBands(
            data.filter(
              (b) =>
                b.created_by_id === user.id || (b.collaborator_emails || []).includes(user.email),
            ),
          );
        }
      })
      .catch(() => {});
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <aside className='w-[240px] shrink-0 h-full bg-[#0e0e0e] flex flex-col border-r border-[#1a1a1a]'>
      <div
        className='px-4 py-6 cursor-pointer flex items-center justify-start'
        onClick={() => navigate('/')}
      >
        <Logo className='w-full h-auto max-h-24 object-contain' />
      </div>

      <nav className='px-3 flex flex-col gap-1'>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#1a1a1a] text-white'
                  : 'text-[#a0a0a0] hover:text-white hover:bg-[#161616]'
              }`
            }
          >
            <span className='w-6 h-6 flex items-center justify-start shrink-0'>
              <item.icon size={18} strokeWidth={1.75} />
            </span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className='mt-6 px-5 flex items-center justify-between'>
        <span className='text-[11px] font-bold text-[#707070] uppercase tracking-wider'>
          Bandas
        </span>
        <button
          onClick={() => navigate('/my-band')}
          className='text-[#707070] hover:text-white transition-colors'
          title='Cadastrar banda'
        >
          <Plus size={16} />
        </button>
      </div>

      <div className='flex-1 overflow-y-auto px-2 mt-2 pb-4'>
        {bands
          .filter((b) => !myBands.some((m) => m.id === b.id))
          .map((b) => (
            <NavLink
              key={b.id}
              to={bandUrl(b)}
              onClick={onNavigate}
              className='flex items-center gap-4 px-3 py-2 rounded-md hover:bg-[#161616] text-[#909090] hover:text-white text-sm transition-colors'
            >
              {b.logo_url ? (
                <img src={b.logo_url} alt='' className='w-6 h-6 rounded object-cover shrink-0' />
              ) : (
                <span className='w-6 h-6 rounded bg-[#222] flex items-center justify-center shrink-0'>
                  <Users size={12} className='text-[#666]' />
                </span>
              )}
              <span className='truncate'>{b.name}</span>
            </NavLink>
          ))}
      </div>

      <div className='px-3 py-3 border-t border-[#1a1a1a]'>
        {user ? (
          <div className='rounded-md bg-[#161616] overflow-hidden'>
            <button
              onClick={() => navigate('/profile')}
              className='w-full flex items-center gap-4 px-3 py-2.5 hover:bg-[#1c1c1c] text-white text-sm font-medium transition-colors'
              title='Gerenciar minha conta'
            >
              <User size={18} className='text-[#a8f776] shrink-0' />
              <span className='truncate'>{user.user_metadata?.full_name || user.email}</span>
            </button>

            {myBands.length > 0 && (
              <>
                <div className='flex items-center justify-between px-3 pt-2 pb-1'>
                  <span className='text-[10px] font-bold text-[#707070] uppercase tracking-wider'>
                    Bandas
                  </span>
                  <button
                    onClick={() => navigate('/my-band')}
                    className='text-[#707070] hover:text-white transition-colors'
                    title='Cadastrar banda'
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <div className='pb-1'>
                  {myBands.map((b) => {
                    const owned = b.created_by_id === user?.id;
                    return (
                      <NavLink
                        key={b.id}
                        to={bandUrl(b)}
                        onClick={onNavigate}
                        className='flex items-center gap-4 px-3 py-1.5 hover:bg-[#1c1c1c] text-[#d0d0d0] text-sm'
                        title={owned ? 'Sua banda (dono)' : 'Colaborador'}
                      >
                        {b.logo_url || b.photo_url ? (
                          <img
                            src={b.logo_url || b.photo_url}
                            alt=''
                            className='w-5 h-5 rounded object-cover shrink-0'
                          />
                        ) : (
                          <span
                            className={`w-5 h-5 rounded flex items-center justify-center text-[9px] font-black shrink-0 ${owned ? 'bg-gradient-to-br from-[#a8f776] to-[#3a8a1a] text-black' : 'bg-[#2a2a2a] text-[#a8f776]'}`}
                          >
                            {owned ? '★' : '♪'}
                          </span>
                        )}
                        <span className='truncate'>{b.name}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </>
            )}

            <button
              onClick={handleLogout}
              className='w-full flex items-center gap-4 px-3 py-2.5 border-t border-[#1a1a1a] text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs font-semibold transition-colors'
            >
              <LogOut size={18} /> Sair da conta
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className='w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-md bg-white text-black text-sm font-bold hover:bg-[#e0e0e0] transition-colors'
          >
            Entrar / Cadastrar
          </button>
        )}
      </div>
    </aside>
  );
}
