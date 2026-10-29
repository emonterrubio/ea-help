import type { DiagnosticTree } from './types';

const bf2042Ps5Crash: DiagnosticTree = {
  id: 'bf2042-ps5-crash',
  title: 'Battlefield 2042 crashing on PS5',
  gameId: '8',
  platform: 'PS5',
  questions: [
    {
      id: 'when',
      text: 'When does the crash happen?',
      options: [
        { value: 'multiplayer', label: 'During multiplayer matches' },
        { value: 'launch', label: 'When the game starts' },
        { value: 'random', label: 'At random times' },
      ],
    },
    {
      id: 'error',
      text: 'Do you see an error code?',
      options: [
        { value: 'ce', label: 'Yes, a CE- code from PS5' },
        { value: 'none', label: 'No, it just closes' },
      ],
    },
  ],
  steps: {
    update: {
      id: 'update',
      title: 'Install the latest update',
      body: 'On the PS5 Home screen, highlight Battlefield 2042, press Options, then choose Check for Update. Install anything available, then restart the game.',
    },
    rebuild: {
      id: 'rebuild',
      title: 'Clear cache and rebuild the database',
      body: 'Turn off your PS5. Hold the power button until you hear a second beep to start Safe Mode, connect your controller with a USB cable, then choose Clear Cache and Rebuild Database.',
    },
    storage: {
      id: 'storage',
      title: 'Free up storage space',
      body: 'Go to Settings > Storage and make sure at least 100 GB is free. Patches can fail to apply cleanly on a nearly full SSD.',
    },
    network: {
      id: 'network',
      title: 'Check your connection',
      body: 'Go to Settings > Network > Connection Status > Test Internet Connection. If NAT Type shows Type 3, use a wired connection or enable UPnP on your router.',
    },
    licenses: {
      id: 'licenses',
      title: 'Refresh your game licenses',
      body: 'Battlefield 2042 checks your licenses when it starts. A stale license on your PS5 can close the game without an error. I can refresh them from here.',
      fix: {
        kind: 'refresh_entitlements',
        label: 'Refresh my licenses',
        changes: ['Re-sync your Battlefield 2042 licenses with your PS5', 'Nothing is removed or charged'],
      },
    },
    cloudsettings: {
      id: 'cloudsettings',
      title: 'Reset your cloud settings cache',
      body: 'A damaged settings file synced from the cloud can crash the game while a multiplayer match loads. I can reset the cached settings from here.',
      fix: {
        kind: 'reset_cloud_save',
        label: 'Reset cloud settings',
        changes: [
          'Clear the Battlefield 2042 settings cached in the cloud',
          'Your controls and graphics settings go back to defaults',
          'Your progress, unlocks and purchases stay as they are',
        ],
      },
    },
    reinstall: {
      id: 'reinstall',
      title: 'Reinstall the game',
      body: 'Delete Battlefield 2042 from Settings > Storage > Games and Apps, then download it again from your Game Library. Your progress is saved to your EA account.',
    },
  },
  selectPath: (answers) =>
    answers.when === 'multiplayer'
      ? ['update', 'network', 'cloudsettings', 'rebuild', 'reinstall']
      : answers.when === 'launch'
        ? ['update', 'storage', 'licenses', 'rebuild', 'reinstall']
        : ['update', 'rebuild', 'cloudsettings', 'storage', 'reinstall'],
};

const fifa23Connection: DiagnosticTree = {
  id: 'fifa23-connection',
  title: 'FIFA 23 connection drops',
  gameId: '2',
  platform: 'PS5',
  questions: [
    {
      id: 'mode',
      text: 'Which mode disconnects?',
      options: [
        { value: 'fut', label: 'Ultimate Team' },
        { value: 'all', label: 'Every online mode' },
      ],
    },
    {
      id: 'link',
      text: 'How is your PS5 connected?',
      options: [
        { value: 'wifi', label: 'Wi-Fi' },
        { value: 'wired', label: 'Ethernet cable' },
      ],
    },
  ],
  steps: {
    wired: {
      id: 'wired',
      title: 'Use a wired connection',
      body: 'Connect your PS5 to the router with an Ethernet cable. Wi-Fi interference is the most common cause of mid-match disconnects.',
    },
    power: {
      id: 'power',
      title: 'Power cycle your network',
      body: 'Unplug your modem, router and PS5 for 2 minutes. Plug in the modem and router first, wait until they are fully online, then start your PS5.',
    },
    nat: {
      id: 'nat',
      title: 'Check your NAT type',
      body: 'Go to Settings > Network > Connection Status > Test Internet Connection. If NAT Type shows Type 3, enable UPnP on your router.',
    },
  },
  selectPath: (answers) => (answers.link === 'wifi' ? ['wired', 'power', 'nat'] : ['power', 'nat']),
};

export const DIAGNOSTIC_TREES: DiagnosticTree[] = [bf2042Ps5Crash, fifa23Connection];

export const findTree = (treeId: string): DiagnosticTree | undefined =>
  DIAGNOSTIC_TREES.find((tree) => tree.id === treeId);

/** Picks the authored tree for a game and platform, if one exists. */
export const treeFor = (gameId: string, platform: string): DiagnosticTree | undefined =>
  DIAGNOSTIC_TREES.find((tree) => tree.gameId === gameId && tree.platform === platform);
