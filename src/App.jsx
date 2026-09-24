import React from 'react';
import { GangProvider, useGang } from './context/GangContext';
import { Navbar } from './components/Navigation/Navbar';
import { BottomNav } from './components/Navigation/BottomNav';
import { GangMap } from './components/Map/GangMap';
import { ActiveRobsList } from './components/ActiveRobs/ActiveRobsList';
import { NormativaViewer } from './components/Normativa/NormativaViewer';
import { SettingsModal } from './components/Settings/SettingsModal';
import { MoneyConverter } from './components/Converter/MoneyConverter';
import { AlertToast } from './components/Alerts/AlertToast';
import { ProfileModal } from './components/Roster/ProfileModal';
import { RosterModal } from './components/Roster/RosterModal';
import { AdminModal } from './components/Admin/AdminModal';
import { BlipModal } from './components/Map/BlipModal';

const MainLayout = () => {
  const { activeTab, memberName, showRosterModal, setShowRosterModal } = useGang();

  return (
    <div className="flex flex-col h-screen w-screen bg-[#080c14] text-slate-100 overflow-hidden select-none">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Tab Area */}
      <main className="flex-1 relative w-full h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] overflow-hidden">
        {/* We keep the map mounted with invisible + absolute so its container dimensions never collapse to 0x0 */}
        <div 
          className={`w-full h-full ${
            activeTab === 'map' 
              ? 'relative z-0' 
              : 'absolute inset-0 invisible pointer-events-none -z-10'
          }`}
        >
          <GangMap />
        </div>

        {activeTab === 'active_robs' && (
          <div className="w-full h-full">
            <ActiveRobsList />
          </div>
        )}

        {activeTab === 'converter' && (
          <div className="w-full h-full">
            <MoneyConverter />
          </div>
        )}

        {activeTab === 'normativa' && (
          <div className="w-full h-full">
            <NormativaViewer />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="w-full h-full">
            <SettingsModal />
          </div>
        )}
      </main>

      {/* Real-time floating alert toasts */}
      <AlertToast />

      {/* One-time Profile setup for new devices */}
      <ProfileModal isOpen={!memberName} isEditing={false} />

      {/* Gang Roster Modal (Live Connected / Offline Members) */}
      <RosterModal
        isOpen={showRosterModal}
        onClose={() => setShowRosterModal(false)}
      />

      {/* Admin Panel Modal (Exclusive for Gang Leader) */}
      <AdminModal />

      {/* Blip Details Modal */}
      <BlipModal />

      {/* Bottom Nav for mobile screens */}
      <BottomNav />
    </div>
  );
};

export default function App() {
  return (
    <GangProvider>
      <MainLayout />
    </GangProvider>
  );
}
