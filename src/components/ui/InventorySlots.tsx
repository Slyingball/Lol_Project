import { getItemIconUrl } from '../../services/dataDragon';
import { MAX_ITEM_SLOTS } from '../../services/constants';
import type { ItemInstance } from '../../types/item';

interface InventorySlotsProps {
    items: ItemInstance[];
    version: string;
    onRemove: (uid: string) => void;
    maxSlots?: number;
}

export function InventorySlots({
    items,
    version,
    onRemove,
    maxSlots = MAX_ITEM_SLOTS,
}: InventorySlotsProps) {
    const slots = Array.from({ length: maxSlots }, (_, index) => items[index] ?? null);

    return (
        <div className="inventory-slots" aria-label="Inventaire">
            {slots.map((slot, index) => (
                <div
                    key={slot?.uid ?? `empty-${index}`}
                    className={`inventory-slot ${slot ? 'inventory-slot--filled' : 'inventory-slot--empty'}`}
                >
                    <span className="inventory-slot__index">0{index + 1}</span>
                    {slot ? (
                        <>
                            <img
                                className="inventory-slot__image"
                                src={getItemIconUrl(slot.item.id, version)}
                                alt={slot.item.name}
                                loading="lazy"
                            />
                            <span className="inventory-slot__name">{slot.item.name}</span>
                            <button
                                type="button"
                                className="inventory-slot__remove"
                                onClick={() => onRemove(slot.uid)}
                                aria-label={`Retirer ${slot.item.name}`}
                            >
                                Remove
                            </button>
                        </>
                    ) : (
                        <span className="inventory-slot__placeholder">Empty slot</span>
                    )}
                </div>
            ))}
        </div>
    );
}
