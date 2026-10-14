"use client";

import {
    Badge,
    Card,
    PageHeader,
    Segmented,
    Toast,
} from "@/components/portal/UI";
import { fmtDate } from "@/lib/format";
import {
    ACCOUNT,
    MEMBER_SINCE,
    PATIENT,
    PREFERENCES,
    PROFILE,
    SESSIONS,
    type AuthSessionInfo,
    type Preferences,
    type ProfileData,
} from "@/lib/portal-data";
import { BadgeCheck, CalendarDays } from "lucide-react";
import { useState } from "react";
import DetailsForm from "./DetailsForm";
import PreferencesForm from "./PreferencesForm";
import SecurityPanel from "./SecurityPanel";
import SessionsPanel from "./SessionsPanel";

type Tab = "details" | "preferences" | "security" | "sessions";


export default function ProfilePage() {
  const [tab, setTab] = useState<Tab>("details");
  const [profile, setProfile] = useState<ProfileData>(PROFILE);
  const [prefs, setPrefs] = useState<Preferences>(PREFERENCES);
  const [sessions, setSessions] = useState<AuthSessionInfo[]>(SESSIONS);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [hasPassword, setHasPassword] = useState(ACCOUNT.hasPassword);
  const [passwordAge, setPasswordAge] = useState<number | null>(
    ACCOUNT.passwordChangedDaysAgo,
  );
  const [googleLinked, setGoogleLinked] = useState(ACCOUNT.googleLinked);
  const [toast, setToast] = useState<string | null>(null);

  const initials = profile.name.split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p: any) => p[0])
    .join("")
    .toUpperCase();

  const saveProfile = (next: ProfileData) => {
    // Changing a contact detail resets its verification until the patient confirms it.
    const emailChanged =
      next.email.toLowerCase() !== profile.email.toLowerCase();
    const phoneChanged =
      next.phone.replace(/\s/g, "") !== profile.phone.replace(/\s/g, "");
    setProfile({
      ...next,
      emailVerified: emailChanged ? false : profile.emailVerified,
      phoneVerified: phoneChanged ? false : profile.phoneVerified,
    });
    setToast(
      emailChanged || phoneChanged
        ? "Profile saved. Check your messages to verify the new contact details."
        : "Profile saved.",
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Profile"
        title="Your account."
        description="Update your details, choose how we contact you, and manage where you're signed in."
      />

      {/* summary */}
      <Card className="flex flex-wrap items-center gap-5 p-6">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt=""
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : (
          <span
            className="grid h-16 w-16 place-items-center rounded-full bg-[#1F1A15] text-xl font-semibold text-white"
            aria-hidden
          >
            {initials}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xl font-semibold tracking-tight">{profile.name}</p>
          <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#1F1A15]/60">
            <span>ID {PATIENT.id}</span>
            <span className="flex items-center gap-1.5">
              <CalendarDays size={14} /> Patient since{" "}
              {fmtDate(MEMBER_SINCE, { month: "long", year: "numeric" })}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {profile.emailVerified ? (
            <Badge tone="success">
              <BadgeCheck size={12} className="mr-1" /> Email verified
            </Badge>
          ) : (
            <Badge tone="warn">Email unverified</Badge>
          )}
          {profile.phoneVerified ? (
            <Badge tone="success">
              <BadgeCheck size={12} className="mr-1" /> Phone verified
            </Badge>
          ) : (
            <Badge tone="warn">Phone unverified</Badge>
          )}
        </div>
      </Card>

      <Segmented<Tab>
        label="Profile sections"
        value={tab}
        onChange={setTab}
        options={[
          { value: "details", label: "Personal details" },
          { value: "preferences", label: "Preferences" },
          { value: "security", label: "Security" },
          { value: "sessions", label: "Sessions", count: sessions.length },
        ]}
      />

      {tab === "details" && (
        <DetailsForm
          saved={profile}
          avatarUrl={avatarUrl}
          onAvatarChange={setAvatarUrl}
          onSave={saveProfile}
        />
      )}

      {tab === "preferences" && (
        <PreferencesForm
          saved={prefs}
          onSave={(p) => {
            setPrefs(p);
            setToast("Preferences saved.");
          }}
        />
      )}

      {tab === "security" && (
        <SecurityPanel
          hasPassword={hasPassword}
          passwordChangedDaysAgo={passwordAge}
          googleLinked={googleLinked}
          googleEmail={ACCOUNT.googleEmail}
          onPasswordSaved={(signOutOthers) => {
            setHasPassword(true);
            setPasswordAge(0);
            if (signOutOthers) setSessions((s) => s.filter((x) => x.current));
            setToast(
              signOutOthers
                ? "Password updated. Other devices were signed out."
                : "Password updated.",
            );
          }}
          onGoogleChange={(linked) => {
            setGoogleLinked(linked);
            setToast(linked ? "Google connected." : "Google disconnected.");
          }}
        />
      )}

      {tab === "sessions" && (
        <SessionsPanel
          sessions={sessions}
          onRevoke={(id) => {
            setSessions((s) => s.filter((x) => x.id !== id));
            setToast("Device signed out.");
          }}
          onRevokeOthers={() => {
            setSessions((s) => s.filter((x) => x.current));
            setToast("Signed out of all other devices.");
          }}
        />
      )}

      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}
