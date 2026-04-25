"use client";

import { useState } from "react";
import {
  AddressFormPanel,
  AddressItemActions,
  AddAddressButton,
  type AddressValues,
} from "./address-form";

type Address = {
  id: string;
  title: string | null;
  fullName: string;
  phone: string;
  city: string;
  district: string;
  street: string;
  zip: string | null;
  isDefault: boolean;
};

const EMPTY: AddressValues = {
  title: "",
  fullName: "",
  phone: "",
  city: "",
  district: "",
  street: "",
  zip: "",
  isDefault: false,
};

export function AddressesClient({ addresses }: { addresses: Address[] }) {
  const [mode, setMode] = useState<
    { kind: "list" } | { kind: "new" } | { kind: "edit"; id: string }
  >({ kind: "list" });

  if (mode.kind === "new") {
    return (
      <div>
        <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
          — yeni adres
        </p>
        <h3 className="display mt-3 text-2xl">Adres ekle</h3>
        <div className="mt-6">
          <AddressFormPanel
            initial={EMPTY}
            onClose={() => setMode({ kind: "list" })}
          />
        </div>
      </div>
    );
  }

  if (mode.kind === "edit") {
    const a = addresses.find((x) => x.id === mode.id);
    if (!a) {
      setMode({ kind: "list" });
      return null;
    }
    return (
      <div>
        <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
          — düzenle
        </p>
        <h3 className="display mt-3 text-2xl">{a.title ?? a.fullName}</h3>
        <div className="mt-6">
          <AddressFormPanel
            initial={{
              id: a.id,
              title: a.title ?? "",
              fullName: a.fullName,
              phone: a.phone,
              city: a.city,
              district: a.district,
              street: a.street,
              zip: a.zip ?? "",
              isDefault: a.isDefault,
            }}
            onClose={() => setMode({ kind: "list" })}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-end justify-between">
        <p className="text-[11px] uppercase tracking-[0.3em] text-mist">
          {addresses.length} kayıtlı adres
        </p>
        <AddAddressButton onClick={() => setMode({ kind: "new" })} />
      </div>

      {addresses.length === 0 ? (
        <div className="mt-16 border border-line bg-bone p-12 text-center">
          <p className="display text-3xl">Henüz adres yok.</p>
          <p className="mt-4 text-sm text-mist">
            Çıkışta tek tıkla seçebilmen için adres ekle.
          </p>
        </div>
      ) : (
        <ul className="mt-10 grid gap-6 md:grid-cols-2">
          {addresses.map((a) => (
            <li
              key={a.id}
              className="border border-line bg-paper p-6"
            >
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-[0.3em] text-mist">
                  {a.title ?? "Adres"}
                </p>
                {a.isDefault ? (
                  <span className="border border-ink bg-ink px-2 py-0.5 text-[9px] uppercase tracking-[0.25em] text-paper">
                    Varsayılan
                  </span>
                ) : null}
              </div>
              <p className="mt-3 text-sm font-medium">{a.fullName}</p>
              <p className="text-sm text-mist">{a.phone}</p>
              <p className="mt-3 text-sm">{a.street}</p>
              <p className="text-sm text-mist">
                {a.district}, {a.city}
                {a.zip ? ` ${a.zip}` : ""}
              </p>
              <div className="mt-5 border-t border-line pt-4">
                <AddressItemActions
                  id={a.id}
                  isDefault={a.isDefault}
                  onEdit={() => setMode({ kind: "edit", id: a.id })}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
