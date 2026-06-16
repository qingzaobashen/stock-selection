"use client";

import { useState } from "react";
import { Layout, Menu, Typography } from "antd";
import {
  AppstoreOutlined,
  SlidersOutlined,
  LineChartOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";

const { Header: AntHeader } = Layout;

const menuItems = [
  {
    key: "/",
    icon: <LineChartOutlined />,
    label: <Link href="/">市场总览</Link>,
  },
  {
    key: "/industries",
    icon: <AppstoreOutlined />,
    label: <Link href="/industries">行业看板</Link>,
  },
  {
    key: "/screener",
    icon: <SlidersOutlined />,
    label: <Link href="/screener">智能选股</Link>,
  },
];

export function Header() {
  const pathname = usePathname();
  const activeKey =
    pathname === "/"
      ? "/"
      : pathname.startsWith("/industries")
        ? "/industries"
        : pathname.startsWith("/screener")
          ? "/screener"
          : "";

  return (
    <AntHeader
      style={{
        background: "var(--color-bg-card)",
        borderBottom: "1px solid var(--color-border)",
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        position: "sticky",
        top: 0,
        zIndex: 100,
        height: 56,
      }}
    >
      <Typography.Title
        level={4}
        style={{
          margin: 0,
          marginRight: 40,
          color: "var(--color-primary)",
          fontWeight: 700,
          fontSize: 18,
          whiteSpace: "nowrap",
        }}
      >
        选股助手
      </Typography.Title>
      <Menu
        mode="horizontal"
        selectedKeys={[activeKey]}
        items={menuItems}
        style={{
          flex: 1,
          border: "none",
          background: "transparent",
          minWidth: 0,
        }}
      />
    </AntHeader>
  );
}
