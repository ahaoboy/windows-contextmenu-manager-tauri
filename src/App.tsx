import React, { ReactElement, useEffect, useState } from "react";
import {
  Avatar,
  Button,
  Collapse,
  Dropdown,
  Input,
  Layout,
  List,
  Menu,
  Radio,
  Space,
  Switch,
  Tabs,
} from "antd";
import {
  CheckCircleOutlined,
  CheckOutlined,
  CloseCircleOutlined,
  CloseOutlined,
  DownOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import "./App.css";
import { invoke } from "@tauri-apps/api/core";
import { Typography } from "antd";
const { Text, Title } = Typography;

type Type = "Win10" | "Win11";
type Scope = "User" | "Machine";

type MenuItemInfo = {
  icon: Uint8Array | undefined;
  publisher_display_name: string;
  description: string;
  types: string[];
};
type MenuItem = {
  id: string;
  name: string;
  enabled: boolean;
  info?: MenuItemInfo;
};
const { Header, Content } = Layout;

function uint8ArrayToImageUrl(
  data: Uint8Array | undefined,
  mimeType = "image/png",
): string {
  if (!data) {
    return "/public/empty.png";
  }
  const blob = new Blob([new Uint8Array(data)], { type: mimeType });
  return URL.createObjectURL(blob);
}

function restart_explorer() {
  return invoke("restart_explorer");
}
function enable_classic_menu() {
  return invoke("enable_classic_menu");
}
function disable_classic_menu() {
  return invoke("disable_classic_menu");
}
function is_admin() {
  return invoke<boolean>("is_admin");
}
function menu_type() {
  return invoke<Type>("menu_type");
}
function enable(ty: Type, id: string, scope: Scope) {
  return invoke<MenuItem[]>("enable", { ty, id, scope });
}
function disable(ty: Type, id: string, scope: Scope) {
  return invoke<MenuItem[]>("disable", { ty, id, scope });
}
function list(ty: Type, scope: Scope) {
  return invoke<MenuItem[]>("list", { ty, scope });
}

const App = () => {
  const [data, setData] = useState<MenuItem[]>([]);
  const [tabType, setTabType] = useState<Type>("Win11");
  const [menuType, setMenuType] = useState<Type>("Win11");
  const [scope, setScope] = useState<Scope>("User");
  const [admin, setAdmin] = useState<boolean>(false);

  const update = async () => {
    const v = await list(tabType, scope);
    setData(v);
    console.log(v);
    const t = await menu_type();
    setMenuType(t);
    const admin = await is_admin();
    setAdmin(admin);
  };

  useEffect(() => {
    update();
  }, []);

  const Win10 = () => {
    return (
      <Content>
        <List
          itemLayout="horizontal"
          dataSource={[...data, ...data]}
          renderItem={(item) => (
            <List.Item className="item-flex">
              <Space align="start" className="item-space">
                <Avatar shape="square" size={32} src={item.info?.icon} />
                <div className="item-text">
                  <div className="item-title">{item.name}</div>
                  {/* <div className="item-desc">{item.description}</div> */}
                </div>
              </Space>
              <Space>
                <Switch checked={item.enabled} />
                <DownOutlined />
              </Space>
            </List.Item>
          )}
        />
      </Content>
    );
  };

  const get_extra = (info: MenuItemInfo | undefined) => {
    if (!info) {
      return <></>;
    }
    const level = 5;
    const v: ReactElement[] = [];

    for (const k of ["publisher_display_name", "description"] as const) {
      if (info[k]) {
        v.push(<Title level={level}>{k}: {info[k]}</Title>);
      }
    }
    if (info.types && info.types.length > 0) {
      v.push(<Title level={level}>types: {info.types.join(",  ")}</Title>);
    }
    return <>{...v}</>;
  };

  useEffect(() => {
    update();
  }, [scope]);
  const Win11 = () => {
    return (
      <Content>
        <Radio.Group
          defaultValue="User"
          value={scope}
          onChange={(e) => {
            console.log(e.target.value);
            setScope(e.target.value as Scope);
          }}
        >
          <Radio.Button value="User">User</Radio.Button>
          <Radio.Button value="Machine">Machine</Radio.Button>
        </Radio.Group>
        <Collapse
          expandIconPosition={"end"}
          style={{ textAlign: "left" }}
          items={data.map((item) => {
            return {
              label: (
                <Space align="start" className="item-space">
                  <Avatar
                    shape="square"
                    size={32}
                    src={uint8ArrayToImageUrl(item.info?.icon)}
                  />
                  <div className="item-text">
                    <div className="item-title">{item.name}</div>
                  </div>
                </Space>
              ),
              key: item.id,
              children: get_extra(item.info),
              extra: (
                <Switch
                  checked={item.enabled}
                  onChange={async (e) => {
                    const cmd = e ? enable : disable;
                    const v = await cmd(tabType, item.id, scope);
                    setData(v);
                  }}
                />
              ),
            };
          })}
        />
      </Content>
    );
  };

  return (
    <Layout className="container">
      <Header className="header-flex">
        <Space>
          <Button
            icon={admin ? <CheckOutlined /> : <CloseOutlined />}
            onClick={update}
          >
            admin
          </Button>
          <Button icon={<ReloadOutlined />} onClick={update}>refresh</Button>
          <Button onClick={enable_classic_menu}>enable classic menu</Button>
          <Button onClick={disable_classic_menu}>disable classic menu</Button>
          <Button onClick={restart_explorer}>restart explorer</Button>
        </Space>
      </Header>
      <Tabs
        defaultActiveKey="Win11"
        centered
        onChange={(e) => {
          console.log(e);
        }}
        items={[
          {
            label: `Win11`,
            key: "Win11",
            children: <Win11 />,
          },
          {
            label: `Win10`,
            key: "Win10",
            children: <Win10 />,
          },
        ]}
      />
    </Layout>
  );
};

export default App;
