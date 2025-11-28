import React from 'react';
import { CheckCircle } from 'lucide-react';

interface TicketSelectorProps {
  ticketType: 'uniform' | 'class' | 'loyalty' | 'season' | 'timeslot';
  tickets: {
    class: Array<{
      id: string;
      name: string;
      price: number;
      available: number;
      features: string[];
    }>;
    loyalty: Array<{
      id: string;
      name: string;
      price: number;
      available: number;
      discount: string;
      deadline: string;
      features: string[];
    }>;
    season: Array<{
      id: string;
      name: string;
      price: number;
      date: string;
      available: number;
      discount?: string;
      popular?: boolean;
    }>;
    timeslot: Array<{
      id: string;
      name: string;
      price: number;
      available: number;
    }>;
    uniform: Array<{
      id: string;
      name: string;
      price: number;
      available: number;
    }>;
  };
  selectedTicketType: string;
  selectedTimeSlot: string;
  onSelectTicketType: (ticketId: string) => void;
  onSelectTimeSlot: (slotId: string) => void;
  isRSVPed: boolean;
  onBuyTicket: (ticketId?: string, quantity?: number) => void;
  promoCode?: string;
  onPromoCodeChange?: (code: string) => void;
  promoCodeError?: string;
  isValidatingPromo?: boolean;
  onValidatePromo?: () => void;
}

export default function TicketSelector({
  ticketType,
  tickets,
  selectedTicketType,
  selectedTimeSlot,
  onSelectTicketType,
  onSelectTimeSlot,
  isRSVPed,
  onBuyTicket,
  promoCode = '',
  onPromoCodeChange,
  promoCodeError = '',
  isValidatingPromo = false,
  onValidatePromo
}: TicketSelectorProps) {
  // quantities keyed by ticket/slot id so each item can have its own count
  const [quantities, setQuantities] = React.useState<Record<string, number>>({});

  const getQuantity = (id: string) => quantities[id] ?? 1;
  const setQuantityFor = (id: string, next: number) => setQuantities(prev => ({ ...prev, [id]: next }));

  // Calculate total price for a ticket
  const getTotalPrice = (ticket: { price: number }, quantity: number) => {
    return ticket.price * quantity;
  };

  // Get selected ticket details
  const getSelectedTicket = () => {
    if (ticketType === 'uniform' && tickets.uniform.length > 0) {
      return tickets.uniform[0];
    }
    if (ticketType === 'class') {
      return tickets.class.find(t => t.id === selectedTicketType);
    }
    if (ticketType === 'loyalty') {
      return tickets.loyalty.find(t => t.id === selectedTicketType);
    }
    if (ticketType === 'season') {
      return tickets.season.find(t => t.id === selectedTicketType);
    }
    if (ticketType === 'timeslot') {
      return tickets.timeslot.find(t => t.id === selectedTimeSlot);
    }
    return null;
  };

  const selectedTicket = getSelectedTicket();
  const selectedQuantity = selectedTicket ? getQuantity(selectedTicket.id) : 1;
  
  // Get the actual selected ticket for uniform type (handle multiple ticket types)
  let actualSelectedTicket = selectedTicket;
  if (ticketType === 'uniform' && tickets.uniform && tickets.uniform.length > 0) {
    // If multiple ticket types, find the selected one
    if (selectedTicketType && tickets.uniform.length > 1) {
      actualSelectedTicket = tickets.uniform.find((t: any) => t.id === selectedTicketType) || tickets.uniform[0];
    } else {
      actualSelectedTicket = tickets.uniform[0];
    }
  }
  
  const totalPrice = actualSelectedTicket ? getTotalPrice(actualSelectedTicket, getQuantity(actualSelectedTicket.id)) : 0;
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        {ticketType === 'timeslot' ? 'Select Time Slot' : 'Select Ticket'}
      </h3>

      {/* Class Tickets (VVIP, VIP, Regular) */}
      {ticketType === 'class' && (
        <div className="space-y-3 mb-6">
          {tickets.class.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => {
                onSelectTicketType(ticket.id);
                setQuantityFor(ticket.id, 1);
              }}
              className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                selectedTicketType === ticket.id
                  ? 'border-[#27aae2] bg-[#27aae2]/5'
                  : 'border-gray-200 dark:border-gray-700 hover:border-[#27aae2]/50'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">{ticket.name}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{ticket.available} tickets left</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#27aae2]">KES {getTotalPrice(ticket, getQuantity(ticket.id)).toLocaleString()}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">KES {ticket.price.toLocaleString()} each × {getQuantity(ticket.id)}</p>
                </div>
              </div>
              <ul className="space-y-1">
                {ticket.features.map((feature, idx) => (
                  <li key={idx} className="text-xs text-gray-600 dark:text-gray-400 flex items-center space-x-1">
                    <CheckCircle className="w-3 h-3 text-[#27aae2]" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); const cur = getQuantity(ticket.id); setQuantityFor(ticket.id, Math.max(1, cur - 1)); }}
                  className="w-8 h-8 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 flex items-center justify-center text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none"
                  disabled={getQuantity(ticket.id) <= 1}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <div className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md text-sm bg-gray-50 dark:bg-gray-700 dark:text-white">{getQuantity(ticket.id)}</div>
                <button
                  onClick={(e) => { e.stopPropagation(); const cur = getQuantity(ticket.id); setQuantityFor(ticket.id, Math.min(ticket.available || 1, cur + 1)); }}
                  className="w-8 h-8 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 flex items-center justify-center text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none"
                  disabled={getQuantity(ticket.id) >= ticket.available}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loyalty Tickets (Die Hard, Early Bird, Advance, Gate) */}
      {ticketType === 'loyalty' && (
        <div className="space-y-3 mb-6">
          {tickets.loyalty.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => {
                onSelectTicketType(ticket.id);
                setQuantityFor(ticket.id, 1);
              }}
              className={`border-2 rounded-xl p-4 cursor-pointer transition-all relative ${
                selectedTicketType === ticket.id
                  ? 'border-[#27aae2] bg-[#27aae2]/5'
                  : 'border-gray-200 dark:border-gray-700 hover:border-[#27aae2]/50'
              }`}
            >
              {ticket.discount && ticket.discount !== 'Regular Price' && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {ticket.discount}
                </span>
              )}
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">{ticket.name}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{ticket.deadline}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{ticket.available} left</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#27aae2]">KES {getTotalPrice(ticket, getQuantity(ticket.id)).toLocaleString()}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">KES {ticket.price.toLocaleString()} each × {getQuantity(ticket.id)}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); const cur = getQuantity(ticket.id); setQuantityFor(ticket.id, Math.max(1, cur - 1)); }}
                  className="w-8 h-8 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 flex items-center justify-center text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none"
                  disabled={getQuantity(ticket.id) <= 1}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <div className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md text-sm bg-gray-50 dark:bg-gray-700 dark:text-white">{getQuantity(ticket.id)}</div>
                <button
                  onClick={(e) => { e.stopPropagation(); const cur = getQuantity(ticket.id); setQuantityFor(ticket.id, Math.min(ticket.available || 1, cur + 1)); }}
                  className="w-8 h-8 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 flex items-center justify-center text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none"
                  disabled={getQuantity(ticket.id) >= ticket.available}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              </div>
          ))}
        </div>
      )}

      {/* Season Tickets (Daily vs Season Pass) */}
      {ticketType === 'season' && (
        <div className="space-y-3 mb-6">
          {tickets.season.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => {
                onSelectTicketType(ticket.id);
                setQuantityFor(ticket.id, 1);
              }}
              className={`border-2 rounded-xl p-4 cursor-pointer transition-all relative ${
                selectedTicketType === ticket.id
                  ? 'border-[#27aae2] bg-[#27aae2]/5'
                  : 'border-gray-200 dark:border-gray-700 hover:border-[#27aae2]/50'
              } ${ticket.popular ? 'border-[#27aae2]' : ''}`}
            >
              {ticket.popular && (
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-[#27aae2] to-[#1e8bb8] text-white text-xs font-bold px-3 py-1 rounded-full">
                  BEST VALUE
                </span>
              )}
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">{ticket.name}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{ticket.date}</p>
                  {ticket.discount && (
                    <p className="text-xs text-green-600 dark:text-green-400 font-semibold mt-1">{ticket.discount}</p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{ticket.available} available</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#27aae2]">KES {getTotalPrice(ticket, getQuantity(ticket.id)).toLocaleString()}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">KES {ticket.price.toLocaleString()} each × {getQuantity(ticket.id)}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); const cur = getQuantity(ticket.id); setQuantityFor(ticket.id, Math.max(1, cur - 1)); }}
                  className="w-8 h-8 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 flex items-center justify-center text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none"
                  disabled={getQuantity(ticket.id) <= 1}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <div className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md text-sm bg-gray-50 dark:bg-gray-700 dark:text-white">{getQuantity(ticket.id)}</div>
                <button
                  onClick={(e) => { e.stopPropagation(); const cur = getQuantity(ticket.id); setQuantityFor(ticket.id, Math.min(ticket.available || 1, cur + 1)); }}
                  className="w-8 h-8 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 flex items-center justify-center text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none"
                  disabled={getQuantity(ticket.id) >= ticket.available}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              </div>
          ))}
        </div>
      )}

      {/* Time Slot Tickets */}
      {ticketType === 'timeslot' && (
        <div className="space-y-2 mb-6">
          <div className="grid grid-cols-2 gap-2">
            {tickets.timeslot.map((slot) => (
              <div
                key={slot.id}
                onClick={() => slot.available > 0 && (onSelectTimeSlot(slot.id), setQuantityFor(slot.id, 1))}
                className={`border-2 rounded-lg p-3 cursor-pointer transition-all text-center ${
                  selectedTimeSlot === slot.id
                    ? 'border-[#27aae2] bg-[#27aae2]/5'
                    : slot.available > 0
                    ? 'border-gray-200 dark:border-gray-700 hover:border-[#27aae2]/50'
                    : 'border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed'
                }`}
              >
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{slot.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {slot.available > 0 ? `${slot.available} slots left` : 'Fully booked'}
                </p>
                <p className="text-sm font-bold text-[#27aae2] mt-1">KES {getTotalPrice(slot, getQuantity(slot.id)).toLocaleString()}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">KES {slot.price} each × {getQuantity(slot.id)}</p>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); const cur = getQuantity(slot.id); setQuantityFor(slot.id, Math.max(1, cur - 1)); }}
                    className="w-8 h-8 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 flex items-center justify-center text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none"
                    disabled={getQuantity(slot.id) <= 1}
                  >
                    −
                  </button>
                  <div className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md text-sm bg-gray-50 dark:bg-gray-700 dark:text-white">{getQuantity(slot.id)}</div>
                  <button
                    onClick={(e) => { e.stopPropagation(); const cur = getQuantity(slot.id); setQuantityFor(slot.id, Math.min(slot.available || 1, cur + 1)); }}
                    className="w-8 h-8 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 flex items-center justify-center text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none"
                    disabled={getQuantity(slot.id) >= slot.available}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uniform Ticket (Single Price) */}
      {ticketType === 'uniform' && tickets.uniform && tickets.uniform.length > 0 && (
        <div className="mb-6">
          {/* Ticket Type Selector - Show dropdown if multiple ticket types */}
          {tickets.uniform.length > 1 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select the type of ticket
              </label>
              <select
                value={selectedTicketType || tickets.uniform[0].id}
                onChange={(e) => {
                  onSelectTicketType(e.target.value);
                  setQuantityFor(e.target.value, 1);
                }}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#27aae2] focus:border-transparent"
              >
                {tickets.uniform.map((ticket) => (
                  <option key={ticket.id} value={ticket.id}>
                    {ticket.name} - KES {ticket.price.toLocaleString()} {ticket.available !== undefined && ticket.available !== null ? `(${ticket.available} available)` : '(Unlimited)'}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {(() => {
            // Get the currently selected ticket (or first one if none selected)
            const currentTicket = tickets.uniform.find((t: any) => t.id === (selectedTicketType || tickets.uniform[0].id)) || tickets.uniform[0];
            const currentQuantity = getQuantity(currentTicket.id);
            const currentTotal = getTotalPrice(currentTicket, currentQuantity);
            
            return (
              <>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    {currentTotal === 0 ? 'Free' : `KES ${currentTotal.toLocaleString()}`}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">total ({currentQuantity} × KES {currentTicket.price.toLocaleString()})</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {currentTicket.available !== undefined && currentTicket.available !== null ? `${currentTicket.available} tickets available` : 'Unlimited tickets available'}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => { const id = currentTicket.id; const cur = getQuantity(id); setQuantityFor(id, Math.max(1, cur - 1)); }}
                    className="w-8 h-8 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 flex items-center justify-center text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none"
                    disabled={currentQuantity <= 1}
                  >
                    −
                  </button>
                  <div className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md text-sm bg-gray-50 dark:bg-gray-700 dark:text-white">{currentQuantity}</div>
                  <button
                    onClick={() => { const id = currentTicket.id; const cur = getQuantity(id); setQuantityFor(id, Math.min(currentTicket.available !== undefined && currentTicket.available !== null ? currentTicket.available : 999, cur + 1)); }}
                    className="w-8 h-8 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 flex items-center justify-center text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none"
                    disabled={currentTicket.available !== undefined && currentTicket.available !== null && currentQuantity >= currentTicket.available}
                  >
                    +
                  </button>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Promo Code Section */}
      {onPromoCodeChange && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Promo Code (Optional)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => {
                onPromoCodeChange(e.target.value);
              }}
              placeholder="Enter promo code"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#27aae2] focus:border-transparent uppercase"
            />
            {onValidatePromo && (
              <button
                onClick={onValidatePromo}
                disabled={!promoCode.trim() || isValidatingPromo}
                className="px-4 py-2 bg-[#27aae2] text-white rounded-lg font-medium hover:bg-[#1e8bb8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isValidatingPromo ? 'Validating...' : 'Apply'}
              </button>
            )}
          </div>
          {promoCodeError && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">{promoCodeError}</p>
          )}
        </div>
      )}

      {/* Price Summary */}
      {selectedTicket && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedTicket.name} × {selectedQuantity}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                KES {selectedTicket.price.toLocaleString()} each
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                KES {totalPrice.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => {
          // Get the selected ticket ID and quantity
          let ticketId: string | undefined;
          let qty: number = 1;
          
          if (ticketType === 'uniform' && tickets.uniform && tickets.uniform.length > 0) {
            // For uniform type, use selected ticket type or first one
            if (selectedTicketType && tickets.uniform.length > 1) {
              ticketId = selectedTicketType;
              qty = getQuantity(selectedTicketType);
            } else {
              ticketId = tickets.uniform[0].id;
              qty = getQuantity(tickets.uniform[0].id);
            }
          } else if (selectedTicketType) {
            ticketId = selectedTicketType;
            qty = getQuantity(selectedTicketType);
          } else if (selectedTimeSlot) {
            ticketId = selectedTimeSlot;
            qty = getQuantity(selectedTimeSlot);
          }
          
          onBuyTicket(ticketId, qty);
        }}
        disabled={ticketType !== 'uniform' && !selectedTicketType && !selectedTimeSlot}
        className={`w-full py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 ${
          isRSVPed
            ? 'bg-green-600 text-white hover:bg-green-700'
            : ticketType !== 'uniform' && !selectedTicketType && !selectedTimeSlot
            ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-[#27aae2] to-[#1e8bb8] text-white hover:shadow-xl'
        }`}
      >
        {isRSVPed 
          ? (totalPrice === 0 ? 'RSVP Confirmed!' : 'Ticket Purchased!') 
          : (totalPrice === 0 ? 'RSVP' : 'Buy Ticket')
        }
      </button>
    </div>
  );
}
