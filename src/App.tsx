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
import { Typography } from "antd";
import {
  disable,
  disable_classic_menu,
  enable,
  enable_classic_menu,
  get_registry_path,
  is_admin,
  list,
  menu_type,
  MenuItem,
  MenuItemInfo,
  open_app_settings,
  open_file_location,
  open_store,
  restart_explorer,
  Scene,
  SceneList,
  Scope,
  ScopeList,
  Type,
  uint8ArrayToImageUrl,
  uninstall,
} from "./lib";
const { Text, Title } = Typography;
const { Header, Content } = Layout;

const App = () => {
  const [data, setData] = useState<MenuItem[]>([]);
  const [tabType, setTabType] = useState<Type>("Win11");
  const [menuType, setMenuType] = useState<Type>("Win11");
  const [scope, setScope] = useState<Scope>("User");
  const [scene, setScene] = useState<Scene>("File");
  const [admin, setAdmin] = useState<boolean>(false);
  const [spinning, setSpinning] = useState(false);

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

  useEffect(() => {
    update();
  }, [scope, tabType]);

  const Win10 = () => {
    const items = data.filter((i) =>
      get_registry_path(scene).some((p) =>
        i.id.toLowerCase().startsWith(p.toLowerCase())
      )
    );

    return (
      <Content>
        <Radio.Group
          defaultValue="File"
          value={scene}
          onChange={(e) => {
            setScene(e.target.value as Scene);
          }}
        >
          {SceneList.map((v) => (
            <Radio.Button value={v} key={v}>{v}</Radio.Button>
          ))}
        </Radio.Group>
        <Collapse
          expandIconPosition={"end"}
          style={{ textAlign: "left" }}
          items={items.map((item) => {
            return {
              label: (
                <Flex align="center" justify="start" gap="small">
                  <Avatar
                    shape="square"
                    src={uint8ArrayToImageUrl(item.info?.icon)}
                  />
                  <Text>{item.name}</Text>
                  {
                    /* <Button icon={<CopyOutlined />} size="small" onClick={e => {
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
                  }} /> */
                  }
                </Flex>
              ),
              key: item.id,
              children: JSON.stringify(item),
              extra: (
                <Switch
                  checked={item.enabled}
                  onChange={async (e, event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    const cmd = e ? enable : disable;
                    await cmd(tabType, item.id, scope);
                    item.enabled = e
                    setData([...data]);
                  }}
                />
              ),
            };
          })}
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
          title: "type",
          dataIndex: "ty",
          key: "type",
        },
        // {
        //   title: "clsid",
        //   dataIndex: "clsid",
        //   key: "clsid",
        // },
        {
          title: "id",
          dataIndex: "id",
          key: "id",
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
      </Flex>,
    );
    return <>{...v}</>;
  };

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
            {ScopeList.map((v) => (
              <Radio.Button value={v} key={v}>{v}</Radio.Button>
            ))}
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
                  <Text>{item.name}</Text>
                  <Button
                    icon={<CopyOutlined />}
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      navigator.clipboard.writeText(item.name);
                    }}
                  />
                  <Text>|</Text>
                  <Text>{item.id}</Text>
                  <Button
                    icon={<CopyOutlined />}
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      navigator.clipboard.writeText(item.id);
                    }}
                  />
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
                    await cmd(tabType, item.id, scope);
                    item.enabled = e
                    setData([...data]);
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
          {menuType === "Win11"
            ? (
              <Button
                onClick={() => {
                  enable_classic_menu();
                  setMenuType("Win10");
                }}
              >
                enable classic menu
              </Button>
            )
            : (
              <Button
                onClick={() => {
                  disable_classic_menu();
                  setMenuType("Win11");
                }}
              >
                disable classic menu
              </Button>
            )}
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
