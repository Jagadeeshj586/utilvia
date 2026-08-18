"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Download, ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import type {
  CornerDotType,
  CornerSquareType,
  DotType,
  ErrorCorrectionLevel,
  FileExtension,
  Options,
} from "qr-code-styling";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { SITE } from "@/lib/site";
import { cn, downloadBlob } from "@/lib/utils";

type ContentType = "url" | "text" | "email" | "phone" | "sms" | "wifi" | "vcard" | "location" | "event";

const CONTENT_TYPES: { id: ContentType; label: string }[] = [
  { id: "url", label: "URL" },
  { id: "text", label: "Text" },
  { id: "email", label: "Email" },
  { id: "phone", label: "Phone" },
  { id: "sms", label: "SMS" },
  { id: "wifi", label: "WiFi" },
  { id: "vcard", label: "vCard" },
  { id: "location", label: "Location" },
  { id: "event", label: "Event" },
];

const DOT_STYLES: { id: DotType; label: string }[] = [
  { id: "square", label: "Square" },
  { id: "dots", label: "Dots" },
  { id: "rounded", label: "Rounded" },
  { id: "extra-rounded", label: "Extra Rounded" },
  { id: "classy", label: "Classy" },
  { id: "classy-rounded", label: "Classy Rounded" },
];

const CORNER_FRAMES: { id: CornerSquareType; label: string }[] = [
  { id: "square", label: "Square" },
  { id: "extra-rounded", label: "Rounded" },
  { id: "dot", label: "Dot" },
];

const CORNER_DOTS: { id: CornerDotType; label: string }[] = [
  { id: "square", label: "Square" },
  { id: "dot", label: "Dot" },
];

const ECC_LEVELS: ErrorCorrectionLevel[] = ["L", "M", "Q", "H"];

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function toLocalInput(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}T${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function toIcsStamp(value: string) {
  const compact = value.replace(/[-:]/g, "");
  if (compact.length >= 15) return compact.slice(0, 15);
  if (/^\d{8}T\d{4}$/.test(compact)) return `${compact}00`;
  return compact;
}

function escapeVCard(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

function escapeWifi(value: string) {
  return value.replace(/([\\;,:"])/g, "\\$1");
}

function normalizeHex(value: string) {
  const raw = value.trim().replace(/^#/, "");
  const full = raw.length === 3 ? raw.split("").map((char) => char + char).join("") : raw;
  return /^[0-9a-fA-F]{6}$/.test(full) ? `#${full.toUpperCase()}` : null;
}

function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function defaultEventTimes() {
  const start = new Date();
  start.setMinutes(0, 0, 0);
  start.setHours(start.getHours() + 1);
  const end = new Date(start);
  end.setHours(end.getHours() + 1);
  return { start: toLocalInput(start), end: toLocalInput(end) };
}

const EVENT_DEFAULTS = defaultEventTimes();

type QrFields = {
  url: string;
  text: string;
  email: string;
  emailSubject: string;
  emailBody: string;
  phone: string;
  smsPhone: string;
  smsBody: string;
  wifiSsid: string;
  wifiPassword: string;
  wifiSecurity: "WPA" | "WEP" | "nopass";
  wifiHidden: boolean;
  vName: string;
  vOrg: string;
  vTitle: string;
  vPhone: string;
  vEmail: string;
  vUrl: string;
  vAddress: string;
  locLat: string;
  locLng: string;
  locLabel: string;
  eventTitle: string;
  eventLocation: string;
  eventStart: string;
  eventEnd: string;
  eventDescription: string;
};

const INITIAL_FIELDS: QrFields = {
  url: SITE.url,
  text: "Hello from Utilvia",
  email: "",
  emailSubject: "",
  emailBody: "",
  phone: "",
  smsPhone: "",
  smsBody: "",
  wifiSsid: "HomeWifi",
  wifiPassword: "",
  wifiSecurity: "WPA",
  wifiHidden: false,
  vName: "",
  vOrg: "",
  vTitle: "",
  vPhone: "",
  vEmail: "",
  vUrl: "",
  vAddress: "",
  locLat: "",
  locLng: "",
  locLabel: "",
  eventTitle: "",
  eventLocation: "",
  eventStart: EVENT_DEFAULTS.start,
  eventEnd: EVENT_DEFAULTS.end,
  eventDescription: "",
};

function buildPayload(type: ContentType, fields: QrFields) {
  switch (type) {
    case "url":
      return normalizeUrl(fields.url);
    case "text":
      return fields.text.trim();
    case "email": {
      const email = fields.email.trim();
      if (!email) return "";
      const params = new URLSearchParams();
      if (fields.emailSubject.trim()) params.set("subject", fields.emailSubject.trim());
      if (fields.emailBody.trim()) params.set("body", fields.emailBody.trim());
      const query = params.toString();
      return `mailto:${email}${query ? `?${query}` : ""}`;
    }
    case "phone":
      return fields.phone.trim() ? `tel:${fields.phone.trim()}` : "";
    case "sms": {
      const phone = fields.smsPhone.trim();
      if (!phone) return "";
      return fields.smsBody.trim() ? `SMSTO:${phone}:${fields.smsBody.trim()}` : `sms:${phone}`;
    }
    case "wifi": {
      const ssid = escapeWifi(fields.wifiSsid.trim());
      if (!ssid) return "";
      const password = fields.wifiSecurity === "nopass" ? "" : escapeWifi(fields.wifiPassword);
      return `WIFI:T:${fields.wifiSecurity};S:${ssid};${password ? `P:${password};` : ""}H:${fields.wifiHidden};;`;
    }
    case "vcard": {
      if (!fields.vName.trim() && !fields.vPhone.trim() && !fields.vEmail.trim()) return "";
      const name = fields.vName.trim();
      const parts = name ? name.split(/\s+/) : [];
      const last = parts.length > 1 ? parts[parts.length - 1] : "";
      const first = parts.length > 1 ? parts.slice(0, -1).join(" ") : name;
      return [
        "BEGIN:VCARD",
        "VERSION:3.0",
        name ? `N:${escapeVCard(last)};${escapeVCard(first)};;;` : null,
        name ? `FN:${escapeVCard(name)}` : null,
        fields.vOrg.trim() ? `ORG:${escapeVCard(fields.vOrg.trim())}` : null,
        fields.vTitle.trim() ? `TITLE:${escapeVCard(fields.vTitle.trim())}` : null,
        fields.vPhone.trim() ? `TEL;TYPE=CELL:${escapeVCard(fields.vPhone.trim())}` : null,
        fields.vEmail.trim() ? `EMAIL:${escapeVCard(fields.vEmail.trim())}` : null,
        fields.vUrl.trim() ? `URL:${escapeVCard(normalizeUrl(fields.vUrl))}` : null,
        fields.vAddress.trim() ? `ADR;TYPE=WORK:;;${escapeVCard(fields.vAddress.trim())};;;;` : null,
        "END:VCARD",
      ]
        .filter(Boolean)
        .join("\n");
    }
    case "location": {
      const lat = fields.locLat.trim();
      const lng = fields.locLng.trim();
      if (!lat || !lng) return "";
      const label = fields.locLabel.trim();
      return label ? `geo:${lat},${lng}?q=${encodeURIComponent(label)}` : `geo:${lat},${lng}`;
    }
    case "event": {
      if (!fields.eventTitle.trim() || !fields.eventStart) return "";
      const stamp = toIcsStamp(new Date().toISOString().slice(0, 19));
      return [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Utilvia//QR Generator//EN",
        "BEGIN:VEVENT",
        `UID:${stamp}@utilvia.app`,
        `DTSTAMP:${stamp}Z`,
        `SUMMARY:${escapeVCard(fields.eventTitle.trim())}`,
        `DTSTART:${toIcsStamp(fields.eventStart)}`,
        fields.eventEnd ? `DTEND:${toIcsStamp(fields.eventEnd)}` : null,
        fields.eventLocation.trim() ? `LOCATION:${escapeVCard(fields.eventLocation.trim())}` : null,
        fields.eventDescription.trim() ? `DESCRIPTION:${escapeVCard(fields.eventDescription.trim())}` : null,
        "END:VEVENT",
        "END:VCALENDAR",
      ]
        .filter(Boolean)
        .join("\r\n");
    }
  }
}

function contentHint(type: ContentType) {
  switch (type) {
    case "url":
      return "Enter a website URL to encode.";
    case "text":
      return "Enter any plain text.";
    case "email":
      return "Add an email address to create a mailto QR.";
    case "phone":
      return "Add a phone number to start a call.";
    case "sms":
      return "Add a number (and optional message) to start an SMS.";
    case "wifi":
      return "Add a network name to share Wi-Fi.";
    case "vcard":
      return "Add a name, phone, or email for a contact card.";
    case "location":
      return "Add latitude and longitude.";
    case "event":
      return "Add a title and start time for a calendar event.";
  }
}

type QrInstance = {
  update: (options?: Partial<Options>) => void;
  getRawData: (extension?: FileExtension) => Promise<Blob | Buffer | null>;
  append: (container?: HTMLElement) => void;
};

export function QrCodeGenerator() {
  const previewRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<QrInstance | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [type, setType] = useState<ContentType>("url");
  const [fields, setFields] = useState<QrFields>(INITIAL_FIELDS);
  const [dotStyle, setDotStyle] = useState<DotType>("dots");
  const [cornerFrame, setCornerFrame] = useState<CornerSquareType>("square");
  const [cornerDot, setCornerDot] = useState<CornerDotType>("dot");
  const [qrColor, setQrColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [gradient, setGradient] = useState(false);
  const [gradientEnd, setGradientEnd] = useState("#CC785C");
  const [gradientType, setGradientType] = useState<"linear" | "radial">("linear");
  const [logo, setLogo] = useState<string | null>(null);
  const [logoName, setLogoName] = useState<string | null>(null);
  const [logoSize, setLogoSize] = useState(25);
  const [size, setSize] = useState(300);
  const [ecc, setEcc] = useState<ErrorCorrectionLevel>("M");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<FileExtension | null>(null);

  const payload = useMemo(() => buildPayload(type, fields), [type, fields]);
  const ready = Boolean(payload);

  const patch = (partial: Partial<QrFields>) => setFields((current) => ({ ...current, ...partial }));

  useEffect(() => {
    let cancelled = false;
    const container = previewRef.current;
    if (!container) return;

    const options: Options = {
      type: "svg",
      width: size,
      height: size,
      margin: 12,
      data: payload || SITE.url,
      image: logo ?? undefined,
      qrOptions: { errorCorrectionLevel: ecc },
      imageOptions: {
        hideBackgroundDots: true,
        imageSize: logoSize / 100,
        margin: 4,
        crossOrigin: "anonymous",
      },
      dotsOptions: {
        type: dotStyle,
        color: qrColor,
        roundSize: true,
        gradient: gradient
          ? {
              type: gradientType,
              rotation: 0,
              colorStops: [
                { offset: 0, color: qrColor },
                { offset: 1, color: gradientEnd },
              ],
            }
          : undefined,
      },
      cornersSquareOptions: { type: cornerFrame, color: qrColor },
      cornersDotOptions: { type: cornerDot, color: qrColor },
      backgroundOptions: { color: bgColor },
    };

    (async () => {
      try {
        const imported = await import("qr-code-styling");
        const QRCodeStyling =
          ("default" in imported && imported.default ? imported.default : imported) as new (
            options?: Partial<Options>,
          ) => QrInstance;
        if (cancelled || !previewRef.current) return;
        if (!qrRef.current) {
          const qr = new QRCodeStyling(options);
          previewRef.current.innerHTML = "";
          qr.append(previewRef.current);
          qrRef.current = qr;
        } else {
          qrRef.current.update({
            ...options,
            image: logo ?? "",
            dotsOptions: {
              ...options.dotsOptions,
              gradient: gradient
                ? options.dotsOptions?.gradient
                : undefined,
            },
          });
        }
        setError(ready ? null : contentHint(type));
      } catch {
        if (!cancelled) {
          setError("This content is too long for the current error correction level. Try H or shorten it.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    payload,
    ready,
    type,
    size,
    logo,
    logoSize,
    ecc,
    dotStyle,
    cornerFrame,
    cornerDot,
    qrColor,
    bgColor,
    gradient,
    gradientEnd,
    gradientType,
  ]);

  const onLogo = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a PNG, JPG, SVG, or WebP logo.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo must be under 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setLogo(typeof reader.result === "string" ? reader.result : null);
      setLogoName(file.name);
      setEcc("H");
    };
    reader.readAsDataURL(file);
  };

  const download = async (extension: FileExtension) => {
    if (!ready) {
      toast.error(contentHint(type));
      return;
    }
    const qr = qrRef.current;
    if (!qr) return;
    setBusy(extension);
    try {
      const data = await qr.getRawData(extension);
      if (!(data instanceof Blob)) throw new Error("empty");
      downloadBlob(data, `qr-code.${extension === "jpeg" ? "jpg" : extension}`);
    } catch {
      toast.error("Could not download this QR code. Try another format.");
    } finally {
      setBusy(null);
    }
  };

  const previewScale = Math.min(1, 300 / size);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="space-y-4">
        <Section title="Content">
          <div className="flex flex-wrap gap-2">
            {CONTENT_TYPES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setType(item.id)}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
                  type === item.id
                    ? "border-primary bg-primary/10 text-ink"
                    : "border-[var(--hairline)] bg-canvas text-[var(--muted-ink)] hover:border-primary/50 hover:text-ink",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="mt-4 space-y-3">
            {type === "url" ? (
              <Field label="Website URL" htmlFor="qr-url">
                <Input id="qr-url" value={fields.url} onChange={(e) => patch({ url: e.target.value })} placeholder="https://utilvia.app" />
              </Field>
            ) : null}
            {type === "text" ? (
              <Field label="Text" htmlFor="qr-text">
                <Textarea id="qr-text" value={fields.text} onChange={(e) => patch({ text: e.target.value })} className="min-h-[120px]" />
              </Field>
            ) : null}
            {type === "email" ? (
              <>
                <Field label="Email" htmlFor="qr-email">
                  <Input id="qr-email" type="email" value={fields.email} onChange={(e) => patch({ email: e.target.value })} placeholder="utilvia@outlook.com" />
                </Field>
                <Field label="Subject" htmlFor="qr-email-subject">
                  <Input id="qr-email-subject" value={fields.emailSubject} onChange={(e) => patch({ emailSubject: e.target.value })} />
                </Field>
                <Field label="Message" htmlFor="qr-email-body">
                  <Textarea id="qr-email-body" value={fields.emailBody} onChange={(e) => patch({ emailBody: e.target.value })} className="min-h-[90px]" />
                </Field>
              </>
            ) : null}
            {type === "phone" ? (
              <Field label="Phone number" htmlFor="qr-phone">
                <Input id="qr-phone" value={fields.phone} onChange={(e) => patch({ phone: e.target.value })} placeholder="+1 555 0100" />
              </Field>
            ) : null}
            {type === "sms" ? (
              <>
                <Field label="Phone number" htmlFor="qr-sms-phone">
                  <Input id="qr-sms-phone" value={fields.smsPhone} onChange={(e) => patch({ smsPhone: e.target.value })} placeholder="+1 555 0100" />
                </Field>
                <Field label="Message" htmlFor="qr-sms-body">
                  <Textarea id="qr-sms-body" value={fields.smsBody} onChange={(e) => patch({ smsBody: e.target.value })} className="min-h-[90px]" />
                </Field>
              </>
            ) : null}
            {type === "wifi" ? (
              <>
                <Field label="Network name (SSID)" htmlFor="qr-wifi-ssid">
                  <Input id="qr-wifi-ssid" value={fields.wifiSsid} onChange={(e) => patch({ wifiSsid: e.target.value })} />
                </Field>
                <Field label="Password" htmlFor="qr-wifi-pass">
                  <Input
                    id="qr-wifi-pass"
                    type="password"
                    value={fields.wifiPassword}
                    onChange={(e) => patch({ wifiPassword: e.target.value })}
                    disabled={fields.wifiSecurity === "nopass"}
                  />
                </Field>
                <Field label="Encryption" htmlFor="qr-wifi-sec">
                  <select
                    id="qr-wifi-sec"
                    value={fields.wifiSecurity}
                    onChange={(e) => patch({ wifiSecurity: e.target.value as QrFields["wifiSecurity"] })}
                    className="h-10 w-full rounded-md border border-[var(--hairline)] bg-canvas px-[14px] text-sm"
                  >
                    <option value="WPA">WPA / WPA2</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">None (open)</option>
                  </select>
                </Field>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={fields.wifiHidden}
                    onChange={(e) => patch({ wifiHidden: e.target.checked })}
                  />
                  Hidden network
                </label>
              </>
            ) : null}
            {type === "vcard" ? (
              <>
                <Field label="Full name" htmlFor="qr-v-name">
                  <Input id="qr-v-name" value={fields.vName} onChange={(e) => patch({ vName: e.target.value })} placeholder="Ada Lovelace" />
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Organization" htmlFor="qr-v-org">
                    <Input id="qr-v-org" value={fields.vOrg} onChange={(e) => patch({ vOrg: e.target.value })} />
                  </Field>
                  <Field label="Title" htmlFor="qr-v-title">
                    <Input id="qr-v-title" value={fields.vTitle} onChange={(e) => patch({ vTitle: e.target.value })} />
                  </Field>
                  <Field label="Phone" htmlFor="qr-v-phone">
                    <Input id="qr-v-phone" value={fields.vPhone} onChange={(e) => patch({ vPhone: e.target.value })} />
                  </Field>
                  <Field label="Email" htmlFor="qr-v-email">
                    <Input id="qr-v-email" type="email" value={fields.vEmail} onChange={(e) => patch({ vEmail: e.target.value })} />
                  </Field>
                </div>
                <Field label="Website" htmlFor="qr-v-url">
                  <Input id="qr-v-url" value={fields.vUrl} onChange={(e) => patch({ vUrl: e.target.value })} placeholder="https://" />
                </Field>
                <Field label="Address" htmlFor="qr-v-address">
                  <Input id="qr-v-address" value={fields.vAddress} onChange={(e) => patch({ vAddress: e.target.value })} />
                </Field>
              </>
            ) : null}
            {type === "location" ? (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Latitude" htmlFor="qr-lat">
                    <Input id="qr-lat" value={fields.locLat} onChange={(e) => patch({ locLat: e.target.value })} placeholder="37.7749" />
                  </Field>
                  <Field label="Longitude" htmlFor="qr-lng">
                    <Input id="qr-lng" value={fields.locLng} onChange={(e) => patch({ locLng: e.target.value })} placeholder="-122.4194" />
                  </Field>
                </div>
                <Field label="Label (optional)" htmlFor="qr-loc-label">
                  <Input id="qr-loc-label" value={fields.locLabel} onChange={(e) => patch({ locLabel: e.target.value })} placeholder="Office" />
                </Field>
              </>
            ) : null}
            {type === "event" ? (
              <>
                <Field label="Event title" htmlFor="qr-event-title">
                  <Input id="qr-event-title" value={fields.eventTitle} onChange={(e) => patch({ eventTitle: e.target.value })} />
                </Field>
                <Field label="Location" htmlFor="qr-event-location">
                  <Input id="qr-event-location" value={fields.eventLocation} onChange={(e) => patch({ eventLocation: e.target.value })} />
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Starts" htmlFor="qr-event-start">
                    <Input id="qr-event-start" type="datetime-local" value={fields.eventStart} onChange={(e) => patch({ eventStart: e.target.value })} />
                  </Field>
                  <Field label="Ends" htmlFor="qr-event-end">
                    <Input id="qr-event-end" type="datetime-local" value={fields.eventEnd} onChange={(e) => patch({ eventEnd: e.target.value })} />
                  </Field>
                </div>
                <Field label="Description" htmlFor="qr-event-desc">
                  <Textarea id="qr-event-desc" value={fields.eventDescription} onChange={(e) => patch({ eventDescription: e.target.value })} className="min-h-[90px]" />
                </Field>
              </>
            ) : null}
          </div>
        </Section>

        <Section title="Dot style">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {DOT_STYLES.map((item) => (
              <StyleButton key={item.id} active={dotStyle === item.id} label={item.label} onClick={() => setDotStyle(item.id)}>
                <DotPreview type={item.id} />
              </StyleButton>
            ))}
          </div>
        </Section>

        <Section title="Corner frame">
          <div className="grid grid-cols-3 gap-2">
            {CORNER_FRAMES.map((item) => (
              <StyleButton key={item.id} active={cornerFrame === item.id} label={item.label} onClick={() => setCornerFrame(item.id)}>
                <CornerFramePreview type={item.id} />
              </StyleButton>
            ))}
          </div>
        </Section>

        <Section title="Corner dot">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {CORNER_DOTS.map((item) => (
              <StyleButton key={item.id} active={cornerDot === item.id} label={item.label} onClick={() => setCornerDot(item.id)}>
                <CornerDotPreview type={item.id} />
              </StyleButton>
            ))}
          </div>
        </Section>

        <Section title="Colors">
          <div className="grid gap-4 sm:grid-cols-2">
            <ColorField label="QR color" value={qrColor} onChange={setQrColor} />
            <ColorField label="Background color" value={bgColor} onChange={setBgColor} />
          </div>
          <label className="mt-4 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={gradient} onChange={(e) => setGradient(e.target.checked)} />
            Enable gradient on QR
          </label>
          {gradient ? (
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <ColorField label="Gradient end" value={gradientEnd} onChange={setGradientEnd} />
              <div>
                <Label>Gradient type</Label>
                <div className="mt-1 flex gap-2">
                  {(["linear", "radial"] as const).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setGradientType(item)}
                      className={cn(
                        "h-10 flex-1 rounded-md border text-sm capitalize",
                        gradientType === item
                          ? "border-primary bg-primary/10 text-ink"
                          : "border-[var(--hairline)] bg-canvas text-[var(--muted-ink)]",
                      )}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </Section>

        <Section title="Add logo to center">
          <input
            ref={logoInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
            className="sr-only"
            onChange={(e) => {
              onLogo(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" variant="outline" onClick={() => logoInputRef.current?.click()}>
              <ImagePlus />
              Upload logo image
            </Button>
            {logo ? (
              <div className="flex items-center gap-2 rounded-md border border-[var(--hairline)] bg-canvas px-2 py-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logo} alt="" className="h-8 w-8 rounded object-cover" />
                <span className="max-w-[140px] truncate text-xs text-[var(--muted-ink)]">{logoName}</span>
                <button
                  type="button"
                  className="rounded-full p-1 text-[var(--muted-ink)] hover:text-ink"
                  onClick={() => {
                    setLogo(null);
                    setLogoName(null);
                  }}
                  aria-label="Remove logo"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : null}
          </div>
          <div className="mt-4">
            <div className="mb-2 flex justify-between text-sm">
              <Label>Logo size</Label>
              <span className="tabular-nums text-[var(--muted-ink)]">{logoSize}%</span>
            </div>
            <Slider min={12} max={40} step={1} value={[logoSize]} onValueChange={(value) => setLogoSize(value[0] ?? logoSize)} disabled={!logo} />
          </div>
        </Section>

        <Section title="QR size">
          <div className="mb-2 flex justify-between text-sm">
            <Label>Size</Label>
            <span className="tabular-nums text-[var(--muted-ink)]">{size}px</span>
          </div>
          <Slider min={200} max={600} step={10} value={[size]} onValueChange={(value) => setSize(value[0] ?? size)} />
          <div className="mt-1 flex justify-between text-[11px] text-[var(--muted-ink)]">
            <span>200px</span>
            <span>600px</span>
          </div>
        </Section>

        <Section title="Error correction level">
          <p className="mb-3 text-xs text-[var(--muted-ink)]">Higher = more data redundancy. Use H if adding a logo.</p>
          <div className="flex flex-wrap gap-2">
            {ECC_LEVELS.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setEcc(level)}
                className={cn(
                  "h-10 min-w-12 rounded-md border px-4 text-sm font-semibold",
                  ecc === level
                    ? "border-primary bg-primary/10 text-ink"
                    : "border-[var(--hairline)] bg-canvas text-[var(--muted-ink)] hover:border-primary/50 hover:text-ink",
                )}
              >
                {level}
              </button>
            ))}
          </div>
        </Section>
      </div>

      <div className="order-first lg:order-none lg:sticky lg:top-24 h-fit">
        <div className="rounded-lg border border-[var(--hairline)] bg-canvas p-3 shadow-soft">
          <div className="flex justify-center rounded-lg bg-white p-4">
            <div
              className="overflow-hidden"
              style={{ width: size * previewScale, height: size * previewScale }}
            >
              <div
                ref={previewRef}
                aria-label="QR code preview"
                style={{
                  width: size,
                  height: size,
                  transform: `scale(${previewScale})`,
                  transformOrigin: "top left",
                }}
              />
            </div>
          </div>
          <p className="mt-3 text-center text-sm text-[var(--muted-ink)]">
            {error && !ready ? error : "Scan to test →"}
          </p>
          {error && ready ? <p className="mt-1 text-center text-xs text-destructive">{error}</p> : null}
          <div className="mt-4 grid gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <Button type="button" onClick={() => download("png")} disabled={!ready || busy !== null}>
              <Download />
              {busy === "png" ? "Saving…" : "Download PNG"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => download("svg")} disabled={!ready || busy !== null}>
              {busy === "svg" ? "Saving…" : "Download SVG"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => download("jpeg")} disabled={!ready || busy !== null}>
              {busy === "jpeg" ? "Saving…" : "Download JPEG"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-[var(--hairline)] bg-surface-soft p-5 sm:p-6">
      <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted-ink)]">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: ReactNode }) {
  return (
    <div>
      <Label htmlFor={htmlFor}>{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const [hex, setHex] = useState(value);

  useEffect(() => {
    setHex(value);
  }, [value]);

  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-1 flex gap-2">
        <input
          type="color"
          value={normalizeHex(value) ?? "#000000"}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
          className="h-10 w-12 cursor-pointer rounded-md border border-[var(--hairline)] bg-canvas p-1"
          aria-label={label}
        />
        <Input
          value={hex}
          onChange={(event) => {
            setHex(event.target.value);
            const next = normalizeHex(event.target.value);
            if (next) onChange(next);
          }}
          className="font-mono uppercase"
        />
      </div>
    </div>
  );
}

function StyleButton({
  active,
  label,
  onClick,
  children,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-2 rounded-md border px-2 py-3 text-xs font-medium transition-colors",
        active ? "border-primary bg-canvas text-ink" : "border-[var(--hairline)] bg-canvas text-[var(--muted-ink)] hover:border-primary/50 hover:text-ink",
      )}
    >
      {children}
      {label}
    </button>
  );
}

function DotPreview({ type }: { type: DotType }) {
  const cells = Array.from({ length: 9 });
  return (
    <div className="grid grid-cols-3 gap-0.5">
      {cells.map((_, index) => (
        <span
          key={index}
          className={cn(
            "h-2.5 w-2.5 bg-ink",
            type === "dots" || (type.includes("classy") && (index === 0 || index === 8))
              ? "rounded-full"
              : type === "rounded"
                ? "rounded-[3px]"
                : type === "extra-rounded" || type === "classy-rounded"
                  ? "rounded-[5px]"
                  : "rounded-[1px]",
          )}
        />
      ))}
    </div>
  );
}

function CornerFramePreview({ type }: { type: CornerSquareType }) {
  return (
    <span
      className={cn(
        "block h-8 w-8 border-[3px] border-ink",
        type === "dot" ? "rounded-full" : type === "extra-rounded" ? "rounded-md" : "rounded-[2px]",
      )}
    />
  );
}

function CornerDotPreview({ type }: { type: CornerDotType }) {
  return <span className={cn("block h-5 w-5 bg-ink", type === "dot" ? "rounded-full" : "rounded-[2px]")} />;
}
