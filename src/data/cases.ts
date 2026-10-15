import type { SupportCase } from '@/types/domain';
import fifa22 from '@/assets/images/logos/fifa22_logo.svg';
import battlefield from '@/assets/images/logos/battlefield2042_logo.svg';
import maddenNFL23 from '@/assets/images/logos/madden23_logo.svg';
import lostinrandom from '@/assets/images/logos/lostinrandom_logo.svg';
import swjedifallenorder from '@/assets/images/logos/swjedifo_logo.svg';

const cases: SupportCase[] = [
  {
    id: '1',
    img: fifa22,
    game: 'FIFA 22',
    platform: 'XBox One',
    case: '5674334351',
    status: 'open',
    type: 'active',
    outcome: 'your case is currently being reviewed',
    date: '6/1/2021',
    dateUpdate: '6/9/2021',
    time: '8:03 am PST',
    title: 'disconnecting from EA Server during squad battle matches',
    chipStyle: 'chip-green',
    description:
      "Disconnected from EA during Squad Battle Matches, wasted a lot of time trying to complete SBC's but end up crashing out of the game. Tried around 10 matches, all disconnected during the game, at different times.",
    conversation: '',
  },
  {
    id: '2',
    img: maddenNFL23,
    game: 'Madden NFL 23',
    platform: 'Playstation',
    case: '556433983',
    status: 'closed',
    type: 'active', // still in 30 day resume case window
    outcome: 'waiting on player to resume case',
    date: '5/25/2021',
    dateUpdate: '6/9/2021',
    time: '9:21 am PST',
    title: 'Madden 23 Xbox Series X crashing',
    chipStyle: 'chip-gray',
    description:
      'Madden 23 version on Xbox Series X keeps crashing to the Home Screen when I play (dashboarding). My game doesn’t crash on any other game besides madden 23. It crashes at random moments too but typically in online games. I’ve tried everything, power cycling my console, playing on different TVs/monitors, playing wired/unwired, clearing cashe factory resetting, changing performance mode changing game quality but the game still crashes regardless. I really don’t know what else I can do.',
    conversation:
      "Is it possible to plug the console directly into the wall? The Gen5 console has a built in surge protector and Microsoft has said it's not necessary to use it. Having it in a surge protector could result in console shutdowns. Although that is different than dashboarding, it may be worth trying it plugged into the wall to see if you get the same results.",
  },
  {
    id: '3',
    img: battlefield,
    game: 'Battlefield 2042',
    platform: 'Mobile',
    case: '543434976',
    status: 'closed',
    type: 'inactive', // it's archived
    outcome: 'case resolved', // final outcome
    date: '6/18/2021',
    dateUpdate: '7/19/2021',
    time: '10:14 am PST',
    title: "I didn't get a PIN for two Factor Authentication",
    chipStyle: 'chip-gray',
    description:
      'I can login into B2042 and play one round Warfare, then every time I try and play another I just end up in the hanger and it sends me back to main menu. My only solution is to close the game and start again. Makes playing with friends impossible.',
    conversation:
      "one of the biggest reasons for having Two-factor authentication enabled is to help prevent an account breach assuming the email(s) associated with the account is compromised. If someone has breached a user's associated email account, they can bypass the two-factor authentication all together by having the authentication code sent to said email account. This defeats the entire purpose of having two-factor authentication. Please look into restricting the authentication code to the authentication app if a user has that option enabled on their account.",
  },
  {
    id: '4',
    img: fifa22,
    game: 'FIFA 22',
    platform: 'PC',
    case: '118932342',
    status: 'closed',
    type: 'inactive', // can't reopen case, no resume button
    outcome: 'case resolved',
    date: '3/19/2021',
    dateUpdate: '4/26/2021',
    time: '12:22 pm PST',
    title: 'missing content- Replace lost Draft Token',
    chipStyle: 'chip-gray',
    description:
      "It happens often when I am leading during a match and the opponent is clearly loosing the game, to disconnect saying that one of the opponent connection was lost and the result will be decided in the favor of the one who had not involved the connection loss. Unfortunately the result appears like the match didn't happened and it's frustrating because it's obviously a trick that the opponents are making so they don't lose the game. Can you explain this situation? Thank you!",
    conversation:
      "For help with missing content, please try contacting @EAHelp through Twitter or open a case with a live support advisor here: https://help.ea.com/en/contact-us/new/. You can also go to facebook.com/eahelphub to get in touch with support. They'll look into this for you. Thanks!",
  },
  {
    id: '5',
    img: swjedifallenorder,
    game: 'Star Wars Jedi Fallen Order',
    platform: 'Playstation',
    case: '2086784089',
    status: 'closed',
    type: 'active', //can still be reopened, resume case button available
    outcome: 'case currently being reviewed',
    date: '6/4/2021',
    dateUpdate: '6/9/2021',
    time: '01:09 pm PST',
    title: 'prelaunch access technical support',
    chipStyle: 'chip-gray',
    description:
      "I'm unable to complete the Training in the Force mission to unlock my second combat style. Everytime I launch the mission, it plays the first cutscene, then the Reflection in the Force NPC pops up on the little bridge. I try to talk to him, it just replays the same initial cutscene, then pops me on the bridge again. It's an endless loop and never progresses the quest/mission itself. There's also two of the same NPC overlapping each other, it's really strange.",
    conversation:
      "hey there! If you aren't a subscriber, that might be the root of your issue here as only subscribers can pick a second combat style. If you're a subscriber and pick a second combat style and your subscription later lapses, you will be stuck in the combat style you were specialized into when your subscription lapsed until you decide to subscribe again.",
  },
  {
    id: '6',
    img: lostinrandom,
    game: 'Lost in Random',
    platform: 'Playstation 4',
    case: '599034665',
    status: 'closed',
    type: 'inactive',
    outcome: 'case resolved', // final outcome
    date: '7/16/2021',
    dateUpdate: '8/22/2021',
    time: '03:40 pm PST',
    title: "Multiple bugs report (can't pin, shield visual, minor issues)",
    chipStyle: 'chip-gray',
    description:
      "I am encountering a few issues with the game, one of them being really annoying because it removes one of the fight features. I cannot pin cards on my hand during battle. The numbers 1 and 3 work to scroll, but 2 doesn't ? And we cannot change the controls so... I really want to pin my cards ! Also, sometimes if I'm ending a battle with a shield bubble on, it will stay on my character until I restart the game. I have also encountered that I could not open the inventory (pressing tab) right after defeating Royam. I had to restart the game for it to work. Also, I had finished the side quest for Jared and Jored but I still have the little green ? icon on them. My quest log and the map both say I have finished the quests.",
    conversation:
      "Thanks for making this report. In your opening post, there's a mention of what sounds like a few different things happening. We may already have some active threads, about different reported bugs. Please check through the threads posted here. If there isn't an active thread dedicated to each of the bugs you're experiencing here, please go ahead and create a new bug report, one per each individual bug if each issue persists. That way, we can track things easier and provide relevant information regarding the specific bug. I'll lock this thread in the meantime so as not to split up the information.",
  },
  {
    id: '7',
    img: fifa22,
    game: 'FIFA 22',
    platform: 'XBox',
    case: '555031120',
    status: 'closed',
    type: 'inactive',
    outcome: 'case resolved',
    date: '12/24/2019',
    dateUpdate: '1/16/2020',
    time: '05:48 pm PST',
    title: 'account disabled',
    chipStyle: 'chip-gray',
    description:
      'My account has been disabled but im not play the game since the last time i played for almost 4 month, any suggestion what should I do, I try to contact EA for tech support but the page goes blank.',
    conversation:
      "I checked your account and it looks like an advisor should be able to help with this. To get in touch with one, try messaging @EAHelp through Twitter or open a case with a live support advisor here: https://help.ea.com/en/contact-us/new/. You can also go to facebook.com/eahelphub to get in touch with support. They'll look into this for you. Thanks!",
  },
];

export default cases;
