import { ReactElement, useEffect, useState } from "react";
import {
  Avatar,
  Button,
  Collapse,
  Flex,
  Layout,
  Radio,
  Select,
  Space,
  Spin,
  Switch,
  Table,
  TableProps,
  Tabs,
} from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  CopyOutlined,
  MoonOutlined,
  ReloadOutlined,
  SunOutlined,
  TranslationOutlined,
} from "@ant-design/icons";
import "./App.css";
import { Typography } from "antd";
import {
  backup,
  base64ToImageUrl,
  disable,
  disable_classic_menu,
  download,
  enable,
  enable_classic_menu,
  get_registry_path,
  is_admin,
  list,
  menu_type,
  MenuItem,
  open_app_settings,
  open_file_location,
  open_store,
  restart_explorer,
  Scene,
  SceneList,
  Scope,
  ScopeList,
  Type,
  uninstall,
} from "./lib";
import { useTranslation } from "react-i18next";
import { I18nResources } from "./i18n";
import { ConfigProvider, theme } from "antd";
const { defaultAlgorithm, darkAlgorithm } = theme;
const isDark = globalThis.matchMedia("(prefers-color-scheme: dark)").matches;
const { Text, Title } = Typography;
const { Content } = Layout;

const MoreInfoWin11 = ({ item }: { item: MenuItem }) => {
  const { t } = useTranslation();

  const level = 5;
  const v: ReactElement[] = [];
  const { info } = item;
  for (const k of ["id"] as const) {
    v.push(<Title level={level}>{k}: {item[k]}</Title>);
  }
  if (!info) {
    return;
  }

  const dataSource: Record<string, string>[] = [];

  for (
    const name of [
      "publisher_display_name",
      "description",
      "full_name",
    ] as const
  ) {
    if (info[name]) {
      dataSource.push({
        name,
        value: info[name],
      });
    }
  }

  if (info.types.length) {
    dataSource.push({
      name: "type",
      value: info.types.map((i) => i.ty).join("  |  "),
    });
  }

  const columns: TableProps<Record<string, string>>["columns"] = [
    {
      title: "name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "value",
      dataIndex: "value",
      key: "value",
    },
  ];

  return (
    <Flex gap="small" vertical>
      <Table
        dataSource={dataSource}
        columns={columns}
        pagination={false}
        showHeader={false}
      />
      <Flex gap="small">
        <Button
          onClick={() => {
            open_file_location(info.install_path);
          }}
        >
          {t("Open File Location")}
        </Button>
        <Button
          onClick={() => {
            open_app_settings();
          }}
        >
          {t("Open App Settings")}
        </Button>
        <Button
          onClick={() => {
            open_store(info.family_name);
          }}
        >
          {t("Open Store")}
        </Button>
        <Button
          onClick={() => {
            uninstall(info.full_name);
          }}
        >
          {t("Uninstall")}
        </Button>
      </Flex>
    </Flex>
  );
};

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const langs = Object.entries(I18nResources).map(([lang, item]) => ({
    value: lang,
    label: item["translation"]["language"],
  }));
  return (
    <Select
      suffixIcon={<TranslationOutlined />}
      defaultValue="English"
      onChange={(lang) => i18n.changeLanguage(lang)}
      options={langs}
    />
  );
}

const App = () => {
  const [data, setData] = useState<MenuItem[]>([]);
  const [tabType, setTabType] = useState<Type>("Win11");
  const [menuType, setMenuType] = useState<Type>("Win11");
  const [scope, setScope] = useState<Scope>("User");
  const [scene, setScene] = useState<Scene>("File");
  const [admin, setAdmin] = useState<boolean>(false);
  const [spinning, setSpinning] = useState(false);
  const [dark, setDark] = useState(isDark);
  const { t } = useTranslation();

  const update = async () => {
    setSpinning(true);
    const v = await list(tabType, scope);
    setData(v);
    // console.log(v);
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
          expandIconPosition="end"
          style={{ textAlign: "left" }}
          items={items.map((item) => {
            return {
              label: (
                <Flex align="center" justify="start" gap="small">
                  <Avatar
                    shape="square"
                    src={base64ToImageUrl(item.info?.icon)}
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
                    item.enabled = e;
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
          expandIconPosition="end"
          style={{ textAlign: "left" }}
          items={data.map((item) => {
            return {
              label: (
                <Flex align="center" justify="start" gap="small">
                  <Avatar
                    shape="square"
                    src={base64ToImageUrl(item.info?.icon)}
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
              children: <MoreInfoWin11 item={item} />,
              extra: (
                <Switch
                  checked={item.enabled}
                  onChange={async (e, event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    const cmd = e ? enable : disable;
                    await cmd(tabType, item.id, scope);
                    item.enabled = e;
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
    <ConfigProvider
      theme={{ algorithm: dark ? darkAlgorithm : defaultAlgorithm }}
    >
      <Layout className="container">
        <Spin spinning={spinning} fullscreen />
        <Flex justify="center" className="header-flex">
          <Space>
            <Button
              icon={admin ? <CheckOutlined /> : <CloseOutlined />}
              disabled
              onClick={update}
            >
              {t("admin")}
            </Button>
            <Button
              disabled
              icon={menuType === "Win10"
                ? <CheckOutlined />
                : <CloseOutlined />}
            >
              {t("classic")}
            </Button>
            <Button icon={<ReloadOutlined />} onClick={update}>
              {t("refresh")}
            </Button>
            {menuType === "Win11"
              ? (
                <Button
                  onClick={() => {
                    enable_classic_menu();
                    setMenuType("Win10");
                  }}
                >
                  {t("enable classic menu")}
                </Button>
              )
              : (
                <Button
                  onClick={() => {
                    disable_classic_menu();
                    setMenuType("Win11");
                  }}
                >
                  {t("disable classic menu")}
                </Button>
              )}
            <Button onClick={restart_explorer}>{t("restart explorer")}</Button>
            <Button
              onClick={async () => {
                const s = await backup(tabType, scope);
                const name = tabType === "Win11"
                  ? `backup-${tabType}-${scope}.json`
                  : `backup-${tabType}.json`;
                download(s, name);
              }}
            >
              {t("backup")}
            </Button>
            <LanguageSwitcher />

            <Select
              defaultValue={isDark}
              onChange={(v) => setDark(v)}
              options={[
                { label: <MoonOutlined />, value: true },
                { label: <SunOutlined />, value: false },
              ]}
            />
          </Space>
        </Flex>
        <Tabs
          defaultActiveKey="Win11"
          centered
          onChange={(e) => {
            // console.log(e);
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
    </ConfigProvider>
  );
};

export default App;
