import { ReactElement, useEffect, useState } from "react";
import {
  Avatar,
  Button,
  Collapse,
  Flex,
  Layout,
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
  DownloadOutlined,
  MoonOutlined,
  ReloadOutlined,
  SunOutlined,
  TranslationOutlined,
} from "@ant-design/icons";
import "./App.css";
import { Typography } from "antd";
import {
  base64ToImageUrl,
  disable,
  disable_classic_menu,
  downloadAllReg,
  downloadReg,
  enable,
  enable_classic_menu,
  is_admin,
  list,
  match_scene,
  menu_type,
  MenuItem,
  normalizeAmpersands,
  open_app_settings,
  open_file_location,
  open_store,
  restart_explorer,
  Scene,
  SceneList,
  Scope,
  truncateText,
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
  const { i18n, t } = useTranslation();
  const langs = Object.entries(I18nResources).map(([lang, item]) => ({
    value: lang,
    label: item["translation"]["language"],
  }));
  return (
    <Select
      suffixIcon={<TranslationOutlined />}
      defaultValue={t("language")}
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
    console.log(tabType, v);
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
    const sceneItems = data.filter((i) => match_scene(i.id) === scene);
    const Child = () => <Collapse
      expandIconPosition="end"
      style={{ textAlign: "left" }}
      items={sceneItems.map((item) => {
        return {
          label: (
            <Flex align="center" justify="start" gap="small">
              <Avatar
                shape="square"
                src={base64ToImageUrl(item.info?.icon)}
              />
              <Text>{truncateText(normalizeAmpersands(item.name))}</Text>
              <Button
                icon={<CopyOutlined />}
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  navigator.clipboard.writeText(
                    truncateText(normalizeAmpersands(item.name)),
                  );
                }}
              />
              <Text>{truncateText(item.id)}</Text>
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
          children: (
            <Typography.Text style={{ whiteSpace: "pre-wrap" }}>
              {item.info?.reg_txt || ""}
            </Typography.Text>
          ),
          extra: <Flex gap="small" align="center" justify="center">
            <Button
              icon={<DownloadOutlined />}
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                downloadReg(item, "Win10");
              }}
            />
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
          </Flex>
        };
      })}
    />

    const items = SceneList.map((v => ({
      label: v,
      key: v,
      children: <Child />,
    })));
    return (
      <Content>
        <Tabs
          defaultActiveKey={scene}
          centered
          onChange={(e) => {
            setScene(e as Scene);
          }}
          tabPosition="left"
          items={items}
          tabBarGutter={0}
        />

      </Content>
    );
  };

  const Win11 = () => {
    const Child = () => <Collapse
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
              <Text ellipsis > {truncateText(normalizeAmpersands(item.name))}</Text>
              <Button
                icon={<CopyOutlined />}
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  navigator.clipboard.writeText(
                    truncateText(normalizeAmpersands(item.name)),
                  );
                }}
              />
              <Text>|</Text>
              <Text>{truncateText(item.id)}</Text>
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
          extra: <Flex gap="small" align="center" justify="center">
            <Button
              icon={<DownloadOutlined />}
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                downloadReg(item, 'Win11');
              }}
            />
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
          </Flex>
        };
      })}
    />;
    const items = [{
      label: `User`,
      key: "User",
      children: <Child />,
    },]

    if (admin) {
      items.push({
        label: `Machine`,
        key: "Machine",
        children: <Child />,
      });
    }
    return (
      <Content>
        <Tabs
          tabBarGutter={0}
          defaultActiveKey={scope}
          centered
          onChange={(e) => {
            setScope(e as Scope);
          }}
          tabPosition="left"
          items={items}
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
                downloadAllReg(data, tabType, tabType === 'Win11' ? scope : undefined);
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
