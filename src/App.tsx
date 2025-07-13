import React, { useEffect, useState } from 'react';
import { Layout, Input, Button, Dropdown, Menu, List, Switch, Avatar, Space, Tabs } from 'antd';
import { ReloadOutlined, DownOutlined } from '@ant-design/icons';
import './App.css';
import { invoke } from '@tauri-apps/api/core';

type Type = "Win10" | "Win11"
type MenuItem = {
  id: string,
  name: string,
  icon: Uint8Array | undefined
  enabled: boolean
}
const { Header, Content } = Layout;

const disableMenu = (
  <Menu>
    <Menu.Item key="user">User</Menu.Item>
    <Menu.Item key="system">System</Menu.Item>
  </Menu>
);

function uint8ArrayToImageUrl(data: Uint8Array | undefined, mimeType = "image/png"): string {
  if (!data) {
    return "/public/empty.png"
  }
  const blob = new Blob([new Uint8Array(data)], { type: mimeType });
  return URL.createObjectURL(blob);
}

const App = () => {
  const [data, setData] = useState<MenuItem[]>([])
  const [tabType, setTabType] = useState<Type>("Win11")
  const [menuType, setMenuType] = useState<Type>("Win11")
  const update = async () => {
    const v = await invoke<MenuItem[]>("list", { ty: tabType })
    setData(v)
    console.log(v)
    const t = await invoke<Type>("menu_type")
    setMenuType(t)
  }

  useEffect(() => {
    update()
  }, [])




  const Win10 = () => {
    return <Content>
      <List
        itemLayout="horizontal"
        dataSource={data}
        renderItem={item => (
          <List.Item className="item-flex">
            <Space align="start" className="item-space">
              <Avatar shape="square" size={32} src={item.icon} />
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
  }

  const Win11 = () => {
    return <Content>
      <List
        itemLayout="horizontal"
        dataSource={data}
        renderItem={item => (
          <List.Item className="item-flex">
            <Space align="start" className="item-space">
              <Avatar shape="square" size={32} src={uint8ArrayToImageUrl(item.icon)} />
              <div className="item-text">
                <div className="item-title">{item.name}</div>
                {/* <div className="item-desc">{item.description}</div> */}
              </div>
            </Space>
            <Space>
              <Switch checked={item.enabled} onChange={async e => {
                const cmd = e ? "enable" : "disable"
                const v = await invoke<MenuItem[]>(cmd, { id: item.id, ty: tabType })
                console.log(e, v)
                setData(v)
              }} />
            </Space>
          </List.Item>
        )}
      />
    </Content>
  }

  return <Layout className="container">
    <Header className="header-flex">
      <Space>
        <Button icon={<ReloadOutlined />} onClick={update} />
      </Space>
    </Header>
    <Tabs
      defaultActiveKey="Win11"
      centered
      onChange={e => {
        console.log(e)
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
      ]
      }
    />
  </Layout>
}


export default App;
