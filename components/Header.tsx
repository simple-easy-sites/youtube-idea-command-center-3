
import React, { useState, useEffect } from 'react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Select } from './ui/Select'; // Import Select component

interface HeaderProps {
  currentProfile: string;
  allProfiles: string[];
  onActivateProfile: (newProfile: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentProfile, allProfiles, onActivateProfile }) => {
  const [newProfileInput, setNewProfileInput] = useState('');

  useEffect(() => {
    // If currentProfile changes and it's a valid profile,
    // ensure newProfileInput is cleared if it matches the new currentProfile.
    // This is to prevent showing the same name in input after selection from dropdown.
    if (currentProfile && newProfileInput === currentProfile) {
      setNewProfileInput('');
    }
  }, [currentProfile, newProfileInput]);

  const handleNewProfileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewProfileInput(e.target.value);
  };

  const handleCreateAndSwitchProfile = () => {
    if (newProfileInput.trim() !== "") {
      onActivateProfile(newProfileInput.trim());
      setNewProfileInput(''); // Clear input after submission
    }
  };
  
  const handleNewProfileInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCreateAndSwitchProfile();
    }
  };

  const profileOptions = allProfiles.map(p => ({ value: p, label: p }));

  return (
    <header className="py-8 md:py-12">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-400 tracking-tight pb-1">
          YouTube Idea Command Center
          <span 
            className="ml-3 text-yellow-300" 
            aria-label="lightbulb emoji"
            style={{ filter: 'drop-shadow(0 0 18px rgba(255, 223, 0, 0.95))' }}
          >
            💡
          </span>
        </h1>
        <p className="text-[var(--text-secondary)] mt-4 text-lg md:text-xl font-light max-w-3xl mx-auto">Your daily hub for AI-powered content ideation and strategy.</p>
      </div>

      <div className="mt-10 max-w-2xl mx-auto glass-card p-6 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4 items-end">
          <Select
            label="Active Profile"
            id="profileSwitchSelect"
            options={profileOptions}
            value={currentProfile}
            onChange={(e) => onActivateProfile(e.target.value)}
            placeholder={allProfiles.length === 0 ? "No profiles yet, create one!" : "Select a Profile"}
            disabled={allProfiles.length === 0 && !currentProfile}
            className="!py-3 !text-base"
            containerClassName="w-full"
          />
          <div className="flex flex-col sm:flex-row items-end space-y-3 sm:space-y-0 sm:space-x-3 w-full">
            <Input
              label="Create New Profile"
              id="newProfileName"
              type="text"
              value={newProfileInput}
              onChange={handleNewProfileInputChange}
              onKeyPress={handleNewProfileInputKeyPress}
              placeholder="Type new profile name"
              aria-label="New Profile Name"
              className="flex-grow !py-3 !text-base"
              containerClassName="w-full sm:flex-grow"
            />
            <Button 
              onClick={handleCreateAndSwitchProfile} 
              variant="secondary" 
              size="md"
              className="w-full sm:w-auto !py-3 self-end" // Align button with input height
              disabled={newProfileInput.trim() === ""}
              title={newProfileInput.trim() === "" ? "Enter a name to create a new profile" : `Create and switch to '${newProfileInput.trim()}'`}
            >
              Create & Switch
            </Button>
          </div>
        </div>
        {currentProfile && (
          <p className="text-center text-sm text-sky-400 mt-5 font-medium">
            Managing ideas for: <strong className="text-sky-300">{currentProfile}</strong>
          </p>
        )}
         {!currentProfile && allProfiles.length === 0 && (
            <p className="text-center text-sm text-yellow-400 mt-5 font-medium">
                Create your first profile above to begin!
            </p>
        )}
        {!currentProfile && allProfiles.length > 0 && (
            <p className="text-center text-sm text-yellow-400 mt-5 font-medium">
                Select an existing profile or create a new one.
            </p>
        )}
      </div>
    </header>
  );
};
