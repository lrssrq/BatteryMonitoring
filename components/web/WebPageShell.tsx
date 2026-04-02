import { LANGUAGES } from "@/constants/Languages";
import { useSession } from "@/contexts/SessionContext";
import { useSettings } from "@/contexts/SettingsContext";
import { authClient } from "@/lib/auth/auth-client";
import {
  Box,
  Button,
  Container,
  DropdownMenu,
  Flex,
  Heading,
  IconButton,
  Text,
  Theme,
} from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import { router, usePathname } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useWindowDimensions } from "react-native";

type ActionLink = {
  label: string;
  href: string;
  i18nKey?: string;
};

type WebPageShellProps = {
  children: React.ReactNode;
  showBackButton?: boolean;
  backLabel?: string;
  backHref?: string;
};

const NAV_LINKS: ActionLink[] = [
  { label: "Overview", href: "/", i18nKey: "home_header_title" },
  { label: "Analysis", href: "/analysis", i18nKey: "analysis_header_title" },
  { label: "Alerts", href: "/alert", i18nKey: "alert_header_title" },
  { label: "Me", href: "/me", i18nKey: "me_header_title" },
  { label: "Help", href: "/help", i18nKey: "help_header_title" },
];

export default function WebPageShell({
  children,
  showBackButton = false,
  backLabel,
  backHref,
}: WebPageShellProps) {
  const { width, height } = useWindowDimensions();
  const pathname = usePathname();
  const { i18n } = useTranslation();
  const { darkModeEnabled, setDarkMode, language, setLanguage } = useSettings();
  const { data: session } = useSession();
  const desktop = width >= 980;

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  const userName = session?.user?.name;
  const userEmail = session?.user?.email;
  const userInitial = userName?.[0]?.toUpperCase() || "U";

  // Detect touch device — fallback to click-to-open
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    setIsTouch(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsTouch(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const [avatarOpen, setAvatarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const avatarTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const enterAvatar = useCallback(() => {
    if (isTouch) return;
    clearTimeout(avatarTimer.current);
    setAvatarOpen(true);
  }, [isTouch]);
  const leaveAvatar = useCallback(() => {
    if (isTouch) return;
    avatarTimer.current = setTimeout(() => setAvatarOpen(false), 200);
  }, [isTouch]);

  const [langOpen, setLangOpen] = useState(false);
  const langTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const enterLang = useCallback(() => {
    if (isTouch) return;
    clearTimeout(langTimer.current);
    setLangOpen(true);
  }, [isTouch]);
  const leaveLang = useCallback(() => {
    if (isTouch) return;
    langTimer.current = setTimeout(() => setLangOpen(false), 200);
  }, [isTouch]);

  return (
    <Theme
      accentColor="indigo"
      grayColor="slate"
      radius="medium"
      scaling="100%"
      appearance={darkModeEnabled ? "dark" : "light"}
      panelBackground="translucent"
    >
      <Box
        style={{
          height: height,
          backgroundColor: "var(--color-background)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* ─── Top Navigation ─── */}
        <Box
          style={{
            position: "sticky",
            top: 0,
            zIndex: 100,
            width: "100%",
            borderBottom: "1px solid var(--gray-a4)",
            backdropFilter: "saturate(180%) blur(16px)",
            WebkitBackdropFilter: "saturate(180%) blur(16px)",
            backgroundColor: darkModeEnabled
              ? "rgba(0,0,0,0.65)"
              : "rgba(255,255,255,0.8)",
            flexShrink: 0,
          }}
        >
          <Container size="4" px={desktop ? "6" : "4"}>
            <Flex
              align="center"
              justify="between"
              style={{ height: desktop ? 56 : 48 }}
            >
              {/* Logo + Language */}
              <Flex align="center" gap="3">
                <Flex
                  align="center"
                  gap="3"
                  onClick={() => router.navigate("/" as never)}
                  style={{ cursor: "pointer" }}
                >
                  <Box
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "var(--radius-2)",
                      background:
                        "linear-gradient(135deg, var(--indigo-9), var(--cyan-9))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Text
                      size="2"
                      weight="bold"
                      style={{ color: "white", lineHeight: 1 }}
                    >
                      B
                    </Text>
                  </Box>
                  <Heading
                    size="3"
                    weight="bold"
                    style={{
                      letterSpacing: "-0.03em",
                      color: "var(--gray-12)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Battery Monitoring
                  </Heading>
                </Flex>

                {/* Language selector */}
                <DropdownMenu.Root open={langOpen} onOpenChange={setLangOpen} modal={false}>
                  <DropdownMenu.Trigger>
                    <IconButton
                      variant="ghost"
                      size="2"
                      color="gray"
                      onPointerEnter={enterLang}
                      onPointerLeave={leaveLang}
                      style={{ cursor: "pointer" }}
                    >
                      <svg width="16" height="16" viewBox="0 0 15 15" fill="none">
                        <path d="M7.49996 1.80002C4.35194 1.80002 1.79996 4.352 1.79996 7.50002C1.79996 10.648 4.35194 13.2 7.49996 13.2C10.648 13.2 13.2 10.648 13.2 7.50002C13.2 4.352 10.648 1.80002 7.49996 1.80002ZM0.899963 7.50002C0.899963 3.85494 3.85488 0.900024 7.49996 0.900024C11.145 0.900024 14.1 3.85494 14.1 7.50002C14.1 11.1451 11.145 14.1 7.49996 14.1C3.85488 14.1 0.899963 11.1451 0.899963 7.50002Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
                        <path d="M13.4999 7.89998H1.49994V7.09998H13.4999V7.89998Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
                        <path d="M7.09991 13.5V1.5H7.89991V13.5H7.09991zM10.3751 7.49998C10.3751 5.18084 9.59384 3.01962 8.25974 1.6746L8.74023 1.22538C10.2098 2.70942 11.0751 5.00516 11.0751 7.49998C11.0751 9.9948 10.2098 12.2905 8.74023 13.7746L8.25974 13.3254C9.59384 11.9804 10.3751 9.81912 10.3751 7.49998ZM4.62499 7.49998C4.62499 5.18084 5.40624 3.01962 6.74034 1.6746L6.25985 1.22538C4.79028 2.70942 3.92499 5.00516 3.92499 7.49998C3.92499 9.9948 4.79028 12.2905 6.25985 13.7746L6.74034 13.3254C5.40624 11.9804 4.62499 9.81912 4.62499 7.49998Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
                        <path d="M7.49996 3.95002C9.14676 3.95002 10.6731 4.24498 11.8378 4.74498L11.5122 5.45502C10.4468 4.99502 9.02324 4.72502 7.49996 4.72502C5.97668 4.72502 4.55316 4.99502 3.48773 5.45502L3.16211 4.74498C4.32683 4.24498 5.85316 3.95002 7.49996 3.95002ZM7.49996 10.85C9.14676 10.85 10.6731 11.145 11.8378 11.645L11.5122 10.935C10.4468 11.395 9.02324 11.125 7.49996 11.125C5.97668 11.125 4.55316 11.395 3.48773 10.935L3.16211 11.645C4.32683 11.145 5.85316 10.85 7.49996 10.85Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
                      </svg>
                    </IconButton>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content
                    sideOffset={8}
                    align="start"
                    variant="soft"
                    onPointerEnter={enterLang}
                    onPointerLeave={leaveLang}
                    style={{ minWidth: 160 }}
                  >
                    {LANGUAGES.map((lang) => (
                      <DropdownMenu.Item
                        key={lang.code}
                        onSelect={() => {
                          setLanguage(lang.code);
                          setLangOpen(false);
                        }}
                        style={{
                          backgroundColor: language === lang.code ? "var(--indigo-a3)" : undefined,
                          borderRadius: "var(--radius-2)",
                        }}
                      >
                        <Text weight={language === lang.code ? "bold" : "regular"}>
                          {lang.nativeName}
                        </Text>
                      </DropdownMenu.Item>
                    ))}
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
              </Flex>

              {/* Right side: avatar menu + theme toggle */}
              <Flex align="center" gap="3">
                {/* Avatar dropdown with all nav links — hover to open */}
                <DropdownMenu.Root open={avatarOpen} onOpenChange={setAvatarOpen} modal={false}>
                  <DropdownMenu.Trigger>
                    <Box
                      onPointerEnter={enterAvatar}
                      onPointerLeave={leaveAvatar}
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: "50%",
                        background:
                          "linear-gradient(135deg, var(--indigo-9), var(--violet-9), var(--cyan-9))",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        flexShrink: 0,
                        boxShadow: avatarOpen
                          ? "0 0 0 2px var(--indigo-a5)"
                          : "none",
                        transition: "box-shadow 0.15s ease",
                      }}
                    >
                      <Text
                        size="2"
                        weight="bold"
                        style={{ color: "white", lineHeight: 1 }}
                      >
                        {userInitial}
                      </Text>
                    </Box>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content
                    sideOffset={8}
                    align="end"
                    variant="soft"
                    onPointerEnter={enterAvatar}
                    onPointerLeave={leaveAvatar}
                    style={{ minWidth: 240 }}
                  >
                    {/* User info header — only when logged in */}
                    {session?.user && (
                      <>
                        <Box style={{ padding: "8px 12px 4px" }}>
                          <Flex align="center" gap="3">
                            <Box
                              style={{
                                width: 40,
                                height: 40,
                                borderRadius: "50%",
                                background:
                                  "linear-gradient(135deg, var(--indigo-9), var(--violet-9), var(--cyan-9))",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              <Text
                                size="4"
                                weight="bold"
                                style={{ color: "white", lineHeight: 1 }}
                              >
                                {userInitial}
                              </Text>
                            </Box>
                            <Flex direction="column" gap="0">
                              <Text size="2" weight="bold">
                                {userName || "User"}
                              </Text>
                              {userEmail && (
                                <Text size="1" color="gray">
                                  {userEmail}
                                </Text>
                              )}
                            </Flex>
                          </Flex>
                        </Box>
                        <DropdownMenu.Separator />
                      </>
                    )}
                    {NAV_LINKS
                      .filter((item) => session?.user || item.href === "/" || item.href === "/help")
                      .map((item) => {
                      const active = isActive(item.href);
                      return (
                        <DropdownMenu.Item
                          key={item.href}
                          onSelect={(e) => {
                            e.preventDefault();
                            setAvatarOpen(false);
                            requestAnimationFrame(() =>
                              router.navigate(item.href as never)
                            );
                          }}
                          style={{
                            backgroundColor: active
                              ? "var(--indigo-a3)"
                              : undefined,
                            borderRadius: "var(--radius-2)",
                          }}
                        >
                          <Text weight={active ? "bold" : "regular"}>
                            {item.i18nKey && i18n.exists(item.i18nKey)
                              ? i18n.t(item.i18nKey)
                              : item.label}
                          </Text>
                        </DropdownMenu.Item>
                      );
                    })}
                    <DropdownMenu.Separator />
                    {session?.user ? (
                      <DropdownMenu.Item
                        color="red"
                        disabled={loggingOut}
                        onSelect={async (e) => {
                          e.preventDefault();
                          setAvatarOpen(false);
                          await authClient.signOut(
                            {},
                            {
                              onRequest: () => setLoggingOut(true),
                              onSuccess: () => {
                                setLoggingOut(false);
                                router.replace("/" as never);
                              },
                              onError: () => setLoggingOut(false),
                            },
                          );
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 15 15" fill="none" style={{ marginRight: 4 }}>
                          <path d="M3 1C2.44772 1 2 1.44772 2 2V13C2 13.5523 2.44772 14 3 14H10.5C10.7761 14 11 13.7761 11 13.5C11 13.2239 10.7761 13 10.5 13H3V2H10.5C10.7761 2 11 1.77614 11 1.5C11 1.22386 10.7761 1 10.5 1H3ZM12.6036 7.14645C12.7988 7.34171 12.7988 7.65829 12.6036 7.85355L10.6036 9.85355C10.4083 10.0488 10.0917 10.0488 9.89645 9.85355C9.70118 9.65829 9.70118 9.34171 9.89645 9.14645L11.0429 8H6.5C6.22386 8 6 7.77614 6 7.5C6 7.22386 6.22386 7 6.5 7H11.0429L9.89645 5.85355C9.70118 5.65829 9.70118 5.34171 9.89645 5.14645C10.0917 4.95118 10.4083 4.95118 10.6036 5.14645L12.6036 7.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
                        </svg>
                        <Text>{loggingOut ? "..." : i18n.t("me_button_logout")}</Text>
                      </DropdownMenu.Item>
                    ) : (
                      <DropdownMenu.Item
                        onSelect={(e) => {
                          e.preventDefault();
                          setAvatarOpen(false);
                          requestAnimationFrame(() =>
                            router.navigate("/login" as never)
                          );
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 15 15" fill="none" style={{ marginRight: 4 }}>
                          <path d="M4.5 1C4.22386 1 4 1.22386 4 1.5C4 1.77614 4.22386 2 4.5 2H12V13H4.5C4.22386 13 4 13.2239 4 13.5C4 13.7761 4.22386 14 4.5 14H12C12.5523 14 13 13.5523 13 13V2C13 1.44772 12.5523 1 12 1H4.5ZM6.60355 7.14645C6.79882 7.34171 6.79882 7.65829 6.60355 7.85355L4.60355 9.85355C4.40829 10.0488 4.09171 10.0488 3.89645 9.85355C3.70118 9.65829 3.70118 9.34171 3.89645 9.14645L5.04289 8H0.5C0.223858 8 0 7.77614 0 7.5C0 7.22386 0.223858 7 0.5 7H5.04289L3.89645 5.85355C3.70118 5.65829 3.70118 5.34171 3.89645 5.14645C4.09171 4.95118 4.40829 4.95118 4.60355 5.14645L6.60355 7.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
                        </svg>
                        <Text>{i18n.t("me_button_login_register")}</Text>
                      </DropdownMenu.Item>
                    )}
                  </DropdownMenu.Content>
                </DropdownMenu.Root>

                {/* Dark/Light mode toggle */}
                <IconButton
                  variant="ghost"
                  size="3"
                  color="gray"
                  onClick={() => setDarkMode(!darkModeEnabled)}
                  style={{ cursor: "pointer", marginLeft: 4 }}
                >
                  {darkModeEnabled ? (
                    <svg width="20" height="20" viewBox="0 0 15 15" fill="none">
                      <path
                        d="M7.5 0C7.77614 0 8 0.223858 8 0.5V2.5C8 2.77614 7.77614 3 7.5 3C7.22386 3 7 2.77614 7 2.5V0.5C7 0.223858 7.22386 0 7.5 0ZM2.1967 2.1967C2.39196 2.00144 2.70854 2.00144 2.90381 2.1967L4.31802 3.61091C4.51328 3.80617 4.51328 4.12276 4.31802 4.31802C4.12276 4.51328 3.80617 4.51328 3.61091 4.31802L2.1967 2.90381C2.00144 2.70854 2.00144 2.39196 2.1967 2.1967ZM0.5 7C0.223858 7 0 7.22386 0 7.5C0 7.77614 0.223858 8 0.5 8H2.5C2.77614 8 3 7.77614 3 7.5C3 7.22386 2.77614 7 2.5 7H0.5ZM2.1967 12.8033C2.00144 12.608 2.00144 12.2915 2.1967 12.0962L3.61091 10.682C3.80617 10.4867 4.12276 10.4867 4.31802 10.682C4.51328 10.8772 4.51328 11.1938 4.31802 11.3891L2.90381 12.8033C2.70854 12.9986 2.39196 12.9986 2.1967 12.8033ZM12.5 7C12.2239 7 12 7.22386 12 7.5C12 7.77614 12.2239 8 12.5 8H14.5C14.7761 8 15 7.77614 15 7.5C15 7.22386 14.7761 7 14.5 7H12.5ZM10.682 4.31802C10.4867 4.12276 10.4867 3.80617 10.682 3.61091L12.0962 2.1967C12.2915 2.00144 12.608 2.00144 12.8033 2.1967C12.9986 2.39196 12.9986 2.70854 12.8033 2.90381L11.3891 4.31802C11.1938 4.51328 10.8772 4.51328 10.682 4.31802ZM8 12.5C8 12.2239 7.77614 12 7.5 12C7.22386 12 7 12.2239 7 12.5V14.5C7 14.7761 7.22386 15 7.5 15C7.77614 15 8 14.7761 8 14.5V12.5ZM10.682 10.682C10.8772 10.4867 11.1938 10.4867 11.3891 10.682L12.8033 12.0962C12.9986 12.2915 12.9986 12.608 12.8033 12.8033C12.608 12.9986 12.2915 12.9986 12.0962 12.8033L10.682 11.3891C10.4867 11.1938 10.4867 10.8772 10.682 10.682ZM5.5 7.5C5.5 6.39543 6.39543 5.5 7.5 5.5C8.60457 5.5 9.5 6.39543 9.5 7.5C9.5 8.60457 8.60457 9.5 7.5 9.5C6.39543 9.5 5.5 8.60457 5.5 7.5ZM7.5 4.5C5.84315 4.5 4.5 5.84315 4.5 7.5C4.5 9.15685 5.84315 10.5 7.5 10.5C9.15685 10.5 10.5 9.15685 10.5 7.5C10.5 5.84315 9.15685 4.5 7.5 4.5Z"
                        fill="currentColor"
                        fillRule="evenodd"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 15 15" fill="none">
                      <path
                        d="M2.89998 0.499976C2.89998 0.279062 2.72089 0.0999756 2.49998 0.0999756C2.27906 0.0999756 2.09998 0.279062 2.09998 0.499976V1.09998H1.49998C1.27906 1.09998 1.09998 1.27906 1.09998 1.49998C1.09998 1.72089 1.27906 1.89998 1.49998 1.89998H2.09998V2.49998C2.09998 2.72089 2.27906 2.89998 2.49998 2.89998C2.72089 2.89998 2.89998 2.72089 2.89998 2.49998V1.89998H3.49998C3.72089 1.89998 3.89998 1.72089 3.89998 1.49998C3.89998 1.27906 3.72089 1.09998 3.49998 1.09998H2.89998V0.499976ZM5.89998 3.49998C5.89998 3.27906 5.72089 3.09998 5.49998 3.09998C5.27906 3.09998 5.09998 3.27906 5.09998 3.49998V4.09998H4.49998C4.27906 4.09998 4.09998 4.27906 4.09998 4.49998C4.09998 4.72089 4.27906 4.89998 4.49998 4.89998H5.09998V5.49998C5.09998 5.72089 5.27906 5.89998 5.49998 5.89998C5.72089 5.89998 5.89998 5.72089 5.89998 5.49998V4.89998H6.49998C6.72089 4.89998 6.89998 4.72089 6.89998 4.49998C6.89998 4.27906 6.72089 4.09998 6.49998 4.09998H5.89998V3.49998ZM1.89998 6.49998C1.89998 6.27906 1.72089 6.09998 1.49998 6.09998C1.27906 6.09998 1.09998 6.27906 1.09998 6.49998V7.09998H0.499976C0.279062 7.09998 0.0999756 7.27906 0.0999756 7.49998C0.0999756 7.72089 0.279062 7.89998 0.499976 7.89998H1.09998V8.49998C1.09998 8.72089 1.27906 8.89998 1.49998 8.89998C1.72089 8.89998 1.89998 8.72089 1.89998 8.49998V7.89998H2.49998C2.72089 7.89998 2.89998 7.72089 2.89998 7.49998C2.89998 7.27906 2.72089 7.09998 2.49998 7.09998H1.89998V6.49998ZM8.54406 0.982327C8.24849 0.802032 7.90137 1.09447 7.99847 1.42048C8.55142 3.15822 8.28335 5.09095 7.15786 6.63762C6.03238 8.18428 4.28085 9.03851 2.48457 9.10768C2.14218 9.12068 1.96326 9.50143 2.17961 9.77061C3.75734 11.6927 6.42192 12.5416 8.93079 11.7005C11.4397 10.8594 13.1 8.49513 13.1 5.84141C13.1 3.68498 11.8784 1.74482 10.0082 0.771398C9.52193 0.511761 9.07488 0.710806 8.81219 0.870992L8.54406 0.982327Z"
                        fill="currentColor"
                        fillRule="evenodd"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </IconButton>
              </Flex>
            </Flex>
          </Container>
        </Box>

        {/* ─── Main Content ─── */}
        <Box
          style={{
            flex: 1,
            overflowY: "auto",
            minHeight: 0,
          }}
        >
          <Container
            size="4"
            px={desktop ? "6" : "4"}
            py={desktop ? "6" : "4"}
          >
            {showBackButton && (
              <Box mb="4">
                <Button
                  variant="ghost"
                  color="gray"
                  size="2"
                  style={{ cursor: "pointer", gap: 6 }}
                  onClick={() => {
                    if (backHref) {
                      router.replace(backHref as never);
                      return;
                    }
                    router.back();
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 15 15"
                    fill="none"
                  >
                    <path
                      d="M6.85355 3.14645C7.04882 3.34171 7.04882 3.65829 6.85355 3.85355L3.70711 7H12.5C12.7761 7 13 7.22386 13 7.5C13 7.77614 12.7761 8 12.5 8H3.70711L6.85355 11.1464C7.04882 11.3417 7.04882 11.6583 6.85355 11.8536C6.65829 12.0488 6.34171 12.0488 6.14645 11.8536L2.14645 7.85355C1.95118 7.65829 1.95118 7.34171 2.14645 7.14645L6.14645 3.14645C6.34171 2.95118 6.65829 2.95118 6.85355 3.14645Z"
                      fill="currentColor"
                      fillRule="evenodd"
                      clipRule="evenodd"
                    />
                  </svg>
                  {backLabel || i18n.t("common_back")}
                </Button>
              </Box>
            )}
            {children}
          </Container>
        </Box>

        {/* ─── Footer ─── */}
        <Box
            style={{
              borderTop: "1px solid var(--gray-a4)",
              backgroundColor: "transparent",
              flexShrink: 0,
            }}
          >
            <Container size="4" px={desktop ? "6" : "4"} py="4">
              <Flex align="center" justify="center" gap="2">
                <Box
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: "var(--radius-1)",
                    background:
                      "linear-gradient(135deg, var(--indigo-9), var(--cyan-9))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Text
                    size="1"
                    weight="bold"
                    style={{ color: "white", lineHeight: 1 }}
                  >
                    B
                  </Text>
                </Box>
                <Text size="1" color="gray">
                  Battery Monitoring
                </Text>
              </Flex>
            </Container>
        </Box>
      </Box>
    </Theme>
  );
}
