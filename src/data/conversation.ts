import type { ConversationMessage } from '@/types/domain';

const conversation: ConversationMessage[] = [
  {
    id: '1',
    user: 'EAHelp',
    message:
      "I'd like you to power cycle your equipment with the following steps: unplug your modem, router and console. After 2 minutes plug in the modem and router. Let them come back online completely. Then plug in your console and start it up. Let me know if that helps or not. Thanks!",
    summary: 'Disconnecting from EA Server During Squad Battle Matches',
    time: '1659978641535',
  },
  {
    id: '2',
    user: 'johndoe',
    message:
      "Whenever I play Squad Battles I keep getting disconnected from ultimate team near the end of the game. I can reconnect straight away but when I do, I've lost the game, can't replay it, my players have lost a contract and stamina. It does not happen with any other game modes but squad battles. I have tried troubleshooting my connection using your FAQ and everything is fine. Bit annoyed this is constantly happening really as it is a waste of time as playing it and getting disconnected I'm making no progress.",
    summary: 'Disconnecting from EA Server During Squad Battle Matches',
    time: '1659978869941',
  },
  {
    id: '3',
    user: 'EAHelp',
    message:
      'Not showing any issues at the moment on our side. I would suggest taking a look at our Connection troubleshooting steps which you can find here: https://help.ea.com/en-us/help/faq/connection-troubleshooting-basic/ If those steps don\'t resolve the issue please run the UO trace in these steps http://bit.ly/EA_UOTrace under "Test Your Connection" and post the results so we can determine the cause of the connection problem.',
    time: '1659979058964',
  },
  {
    id: '4',
    user: 'johndoe',
    message:
      'I am constantly getting disconnected during Squad Battles. It seems to happen toward the end of the games. Very frustrating.  It always gives me a 0-3 loss and no points. My internet runs on average 200+ Mbps down and 10+ up. out of the 4 battles at least one will be a disconnect.',
    time: '1659979186575',
  },
  {
    id: '5',
    user: 'EAHelp',
    message:
      "Just so you are aware a disconnection does not mean that your internet dropped or went off. It simply means that you did not have the bandwidth available to continue the game, you can still be logged in and online when this occurs. I'd recommend trying the steps I posted above and speaking with your ISP to work on improving your connection.",
    time: '1659979429190',
  },
];

export default conversation;
