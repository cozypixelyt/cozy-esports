import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Bot, Send, ShieldCheck, Lock, Swords, Wallet, Trophy } from 'lucide-react';

interface ChatMessage {
  sender: 'ai' | 'user';
  text: string;
}

const KNOWLEDGE_RESPONSES: Record<string, string> = {
  pay: `🛡️ **Safe UPI Payment Guide (1 Coin = ₹1 INR)**:\n1. Open **My Wallet** or tap **Add Coins**.\n2. Scan the official UPI QR code with PhonePe, Google Pay, Paytm, or FamApp.\n3. Complete the payment to the organizer.\n4. Copy your **12-digit UPI UTR / Transaction ID** from your receipt.\n5. Paste it in the box and tap **Submit Payment**.\n⚡ Fast verification is active, so your coins will be added quickly!`,
  withdraw: `💰 **How to Withdraw Real Money (1 Coin = ₹1)**:\n1. Go to **My Wallet** tab.\n2. Tap the **Withdraw to UPI** button.\n3. Enter the number of coins to cash out (e.g. 50 Coins = ₹50).\n4. Enter your real **UPI ID** (e.g. yourname@paytm or number@oksbi).\n5. Tap Submit. The organizer will verify and transfer real cash directly to your bank account via UPI!`,
  room: `🔑 **Room ID & Password Guide**:\n- When you register for any tournament, your slot is locked.\n- Room ID and Password will automatically unlock on your tournament card and in **My Matches** before the match starts.\n- **Strict Rule**: Joining the room on time is your own responsibility. Ensure you join 5-10 minutes before start time!`,
  rules: `📋 **Fair Play & Anti-Cheat Rules**:\n- **BGMI**: Mobile phones only (No Emulators, iPads, or config tools).\n- **Free Fire**: Gun skins attributes OFF for fair esports skill.\n- **Minecraft**: Max CPS limit is 15 CPS. No hacked clients or auto-bridge bots.\n- Strict attendance: No refund if you fail to join the custom room on time.`,
  id: `🎮 **Setting Up Game Usernames & IDs**:\n- Go to **Settings** in the bottom navigation.\n- Enter your **BGMI IGN & UID**, **Free Fire Username & UID**, and **Minecraft Username**.\n- When registering for matches, the app automatically submits the matching game credentials!`,
  support: `📩 **Official Support Desk**:\n- Support Email: **cozypixelboy@gmail.com**\n- For any payment verification queries or organizer verification, send an email to our official support team.`,
};

export const AIAssistantModal: React.FC = () => {
  const { isAIAssistantOpen, setIsAIAssistantOpen } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: '👋 Namaste! Welcome to COZY_ESPORTS AI Safety Coach. Main aapko safe UPI coin recharge (₹1 = 1 Coin), tournament join karne, withdrawal process, aur match rules me guide kar sakta hoon.\n\nAap mujhse Hindi ya English me kuch bhi pooch sakte hain!',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  if (!isAIAssistantOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    const userMsg: ChatMessage = { sender: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    const qLower = query.toLowerCase();

    // STRICT SECURITY FILTER: Under NO circumstances reveal the Developer Key / PIN!
    const isAskingDevKey =
      qLower.includes('developer key') ||
      qLower.includes('dev key') ||
      qLower.includes('admin key') ||
      qLower.includes('organizer key') ||
      qLower.includes('developer pin') ||
      qLower.includes('admin pin') ||
      qLower.includes('dev pin') ||
      qLower.includes('organizer pin') ||
      qLower.includes('secret key') ||
      qLower.includes('secret pin') ||
      qLower.includes('key kya hai') ||
      qLower.includes('pin kya hai') ||
      qLower.includes('key bata') ||
      qLower.includes('pin bata') ||
      qLower.includes('key de') ||
      qLower.includes('pin de') ||
      qLower.includes('456877') ||
      (qLower.includes('key') && (qLower.includes('dev') || qLower.includes('developer') || qLower.includes('host') || qLower.includes('admin'))) ||
      (qLower.includes('pin') && (qLower.includes('dev') || qLower.includes('developer') || qLower.includes('host') || qLower.includes('admin'))) ||
      (qLower.includes('password') && (qLower.includes('dev') || qLower.includes('admin') || qLower.includes('console')));

    let responseText = '';

    if (isAskingDevKey) {
      responseText = `🔒 **Security Alert / सुरक्षा सूचना**:\n\nMaaf kijiye, **Developer Key / Organizer PIN** strictly confidential hai aur kisi bhi user ke saath share nahi ki ja sakti.\n\n🛡️ Developer Console sirf authorized **COZY_ESPORTS** tournament host organizers ke liye hai taaki sabhi tournaments aur real-money cash payouts 100% secure rahein.\n\nAgar aap verified organizer banna chahte hain, toh official support email (**cozypixelboy@gmail.com**) par request bhejein.`;
    } else if (qLower.includes('withdraw') || qLower.includes('cashout') || qLower.includes('paise nikal') || qLower.includes('real money')) {
      responseText = KNOWLEDGE_RESPONSES.withdraw;
    } else if (qLower.includes('pay') || qLower.includes('recharge') || qLower.includes('money') || qLower.includes('qr') || qLower.includes('utr') || qLower.includes('coin')) {
      responseText = KNOWLEDGE_RESPONSES.pay;
    } else if (qLower.includes('room') || qLower.includes('pass') || qLower.includes('credential')) {
      responseText = KNOWLEDGE_RESPONSES.room;
    } else if (qLower.includes('support') || qLower.includes('help') || qLower.includes('contact') || qLower.includes('gmail') || qLower.includes('email')) {
      responseText = KNOWLEDGE_RESPONSES.support;
    } else if (qLower.includes('rule') || qLower.includes('cheat') || qLower.includes('ban') || qLower.includes('hack')) {
      responseText = KNOWLEDGE_RESPONSES.rules;
    } else if (qLower.includes('id') || qLower.includes('ign') || qLower.includes('username') || qLower.includes('uid') || qLower.includes('login') || qLower.includes('profile')) {
      responseText = KNOWLEDGE_RESPONSES.id;
    } else if (qLower.includes('dev') || qLower.includes('organizer') || qLower.includes('create tournament') || qLower.includes('host')) {
      responseText = `🛠️ **Hosting Tournaments**:\n\nTournaments host karne ke liye Organizer Console sirf verified admins ke liye uplabdh hai. Verified organizers apne private PIN se console unlock karke new custom tournaments live publish kar sakte hain aur UPI payouts approve kar sakte hain.\n\nAgar aap organizer partnership chahte hain, contact karein: **cozypixelboy@gmail.com**.`;
    } else {
      responseText = `Aapki sahayata ke liye yahan kuch zaroori options hain:\n\n• **Recharge Coins**: 1 INR = 1 Coin. QR scan karke UTR submit karein.\n• **Withdraw Money**: Wallet me 'Withdraw to UPI' par tap karke apna UPI ID dalein.\n• **Game IDs**: Settings me jakar BGMI, Free Fire, aur Minecraft IDs save karein.\n• **Support**: cozypixelboy@gmail.com\n\nAapko kis bare me aur janna hai?`;
    }

    setTimeout(() => {
      setMessages(prev => [...prev, { sender: 'ai', text: responseText }]);
      setIsTyping(false);
    }, 450);
  };

  return (
    <div
      data-modal="true"
      onClick={e => {
        if (e.target === e.currentTarget) setIsAIAssistantOpen(false);
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 md:backdrop-blur-md"
    >
      <div className="relative w-full max-w-lg bg-[#0e1424] border border-red-500/40 rounded-2xl sm:rounded-3xl shadow-2xl shadow-red-950/40 overflow-hidden max-h-[88vh] flex flex-col">
        {/* Header with Deadly Red & Blue Styling */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-red-950/60 via-[#101728] to-blue-950/50 border-b border-red-500/30 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-blue-600 text-white flex items-center justify-center font-bold shadow-lg shadow-red-600/30 shrink-0">
              <Bot className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-display font-black text-white text-sm sm:text-base tracking-wide truncate">
                  COZY AI Safety Assistant
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-600/20 text-blue-300 border border-blue-500/30 shrink-0">
                  ONLINE
                </span>
              </div>
              <p className="text-slate-400 text-xs truncate">
                Instant help for coin recharge, rules &amp; withdrawals.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              setIsAIAssistantOpen(false);
            }}
            aria-label="Close AI assistant"
            className="relative z-30 w-9 h-9 shrink-0 flex items-center justify-center text-slate-300 hover:text-white bg-slate-800/90 hover:bg-red-600/80 border border-slate-700 hover:border-red-400 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Suggestion Chips (Safe, Red & Blue) */}
        <div className="px-4 py-2 bg-[#090d16] border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => handleSend('How do I safely recharge coins with real money?')}
            className="px-2.5 py-1 bg-[#121929] hover:bg-red-950/40 border border-slate-800 hover:border-red-500/40 text-slate-300 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors"
          >
            💳 Safe UPI Recharge
          </button>
          <button
            onClick={() => handleSend('How to withdraw real money to my UPI?')}
            className="px-2.5 py-1 bg-[#121929] hover:bg-blue-950/40 border border-slate-800 hover:border-blue-500/40 text-blue-300 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors"
          >
            💰 Withdraw Real Money
          </button>
          <button
            onClick={() => handleSend('How to get Room ID and Password?')}
            className="px-2.5 py-1 bg-[#121929] hover:bg-red-950/40 border border-slate-800 hover:border-red-500/40 text-red-300 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors"
          >
            🔑 Room ID &amp; Password
          </button>
          <button
            onClick={() => handleSend('How do I set up my game usernames?')}
            className="px-2.5 py-1 bg-[#121929] hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors"
          >
            🎮 Setup Game IDs
          </button>
        </div>

        {/* Chat Messages */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 flex-1 text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-gradient-to-r from-red-600 to-blue-600 text-white font-medium rounded-br-none shadow-md'
                    : 'bg-[#121929] text-slate-200 border border-slate-800 rounded-bl-none shadow-md whitespace-pre-line'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-[#121929] border border-slate-800 rounded-2xl p-3 text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
                <span>Cozy AI is typing...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-[#090d16] border-t border-slate-800 shrink-0">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Ask anything about tournaments, UPI recharge, withdrawal..."
              className="flex-1 bg-[#121828] border border-slate-800 focus:border-red-500/50 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              className="p-2.5 bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-500 hover:to-blue-500 text-white rounded-xl transition-all font-bold active:scale-95 shadow-md shadow-red-600/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
