import React, { ReactElement, useEffect, useState } from "react";
import {
  Avatar,
  Button,
  Collapse,
  Dropdown,
  Flex,
  Input,
  Layout,
  List,
  Menu,
  Radio,
  Space,
  Spin,
  Switch,
  Table,
  Tabs,
} from "antd";
import {
  CheckCircleOutlined,
  CheckOutlined,
  CloseCircleOutlined,
  CloseOutlined,
  CopyOutlined,
  DownOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import "./App.css";
import { invoke } from "@tauri-apps/api/core";
import { Typography } from "antd";
const { Text, Title } = Typography;

type Type = "Win10" | "Win11";
type Scope = "User" | "Machine";

type TypeItem = {
  id: string,
  clsid: string,
  ty: string
}
type MenuItemInfo = {
  icon: Uint8Array | undefined;
  publisher_display_name: string;
  description: string;
  types: TypeItem[];
  family_name: string;
  install_path: string;
  full_name: string;
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
    return "/empty.png";
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
function open_file_location(path: string) {
  return invoke("open_file_location", { path });
}
function open_app_settings() {
  return invoke("open_app_settings");
}
function open_store(name: string) {
  return invoke("open_store", { name });
}
function uninstall(fullname: string) {
  console.log("uninstalling", fullname);
  return invoke("uninstall", { fullname });
}

const App = () => {
  const [data, setData] = useState<MenuItem[]>([]);
  const [tabType, setTabType] = useState<Type>("Win11");
  const [menuType, setMenuType] = useState<Type>("Win11");
  const [scope, setScope] = useState<Scope>("User");
  const [admin, setAdmin] = useState<boolean>(false);
  const [spinning, setSpinning] = useState(false)

  const update = async () => {
    setSpinning(true);
    const v = await list(tabType, scope);
    setData(v);
    console.log(v);
    const t = await menu_type();
    setMenuType(t);
    const admin = await is_admin();
    setAdmin(admin);
    setSpinning(false);
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

    if (info.types.length) {
      const columns = [
        {
          title: 'type',
          dataIndex: 'ty',
          key: 'type',
        },
        {
          title: 'clsid',
          dataIndex: 'clsid',
          key: 'clsid',
        },
        {
          title: 'id',
          dataIndex: 'id',
          key: 'id',
        },
      ];

      v.push(<Table dataSource={info.types} columns={columns} />);
    }


    v.push(
      <Flex gap="small">
        <Button
          onClick={() => {
            open_file_location(info.install_path);
          }}
        >
          Open File Location
        </Button>
        <Button
          onClick={() => {
            open_app_settings();
          }}
        >
          Open App Settings
        </Button>
        <Button
          onClick={() => {
            open_store(info.family_name);
          }}
        >
          Open Store
        </Button>
        <Button
          onClick={() => {
            uninstall(info.full_name);
          }}
        >
          Uninstall
        </Button>
      </Flex>
    )
    return <>{...v}</>;
  };

  useEffect(() => {
    update();
  }, [scope, tabType]);

  const Win11 = () => {
    return (
      <Content>
        {admin && (
          <Radio.Group
            defaultValue="User"
            value={scope}
            onChange={(e) => {
              setScope(e.target.value as Scope);
            }}
          >
            <Radio.Button value="User">User</Radio.Button>
            <Radio.Button value="Machine">Machine</Radio.Button>
          </Radio.Group>
        )}
        <Collapse
          expandIconPosition={"end"}
          style={{ textAlign: "left" }}
          items={data.map((item) => {
            return {
              label: (
                <Flex align="center" justify="start" gap="small">
                  <Avatar
                    shape="square"
                    src={uint8ArrayToImageUrl(item.info?.icon)}
                  />
                  <Text> {item.name} </Text>
                  <Button icon={<CopyOutlined />} size="small" onClick={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    navigator.clipboard.writeText(item.name);

                  }} />
                  <Text>|</Text>
                  <Text> {item.id} </Text>
                  <Button icon={<CopyOutlined />} size="small" onClick={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    navigator.clipboard.writeText(item.id);
                  }} />
                </Flex>
              ),
              key: item.id,
              children: get_extra(item.info),
              extra: (
                <Switch
                  checked={item.enabled}
                  onChange={async (e, event) => {
                    event.preventDefault();
                    event.stopPropagation();
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
      <Spin spinning={spinning} fullscreen />

      <Flex justify="center" className="header-flex">
        <Space>
          <Button
            icon={admin ? <CheckOutlined /> : <CloseOutlined />}
            disabled
            onClick={update}
          >
            admin
          </Button>
          <Button
            disabled
            icon={menuType === "Win10" ? <CheckOutlined /> : <CloseOutlined />}
          >
            classic
          </Button>
          <Button icon={<ReloadOutlined />} onClick={update}>refresh</Button>
          {menuType === 'Win11' ? <Button onClick={() => {
            enable_classic_menu()
            setMenuType("Win10");
          }}>enable classic menu</Button> :
            <Button onClick={() => {
              disable_classic_menu();
              setMenuType("Win11");
            }}>disable classic menu</Button>}
          <Button onClick={restart_explorer}>restart explorer</Button>
        </Space>
      </Flex>
      <Tabs
        defaultActiveKey="Win11"
        centered
        onChange={(e) => {
          console.log(e);
          setTabType(e as Type);
          update();
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
