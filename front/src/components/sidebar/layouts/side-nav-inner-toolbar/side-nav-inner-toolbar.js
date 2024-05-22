import Button from 'devextreme-react/button';
import Drawer from 'devextreme-react/drawer';
import ScrollView from 'devextreme-react/scroll-view';
import Toolbar, { Item } from 'devextreme-react/toolbar';
import React, { useState, useCallback, useRef, useTransition } from 'react';
import { useNavigate } from 'react-router';
import { Header, SideNavigationMenu, Footer } from '../../components';
import './side-nav-inner-toolbar.scss';
import { useScreenSize } from '../../utils/media-query';
import { Template } from 'devextreme-react/core/template';
import { useMenuPatch } from '../../utils/patches';
import vtwPng from "../../../../assets/img/vtw.png";
import { Link } from "react-router-dom";

export default function SideNavInnerToolbar({ children, status }) {
  const scrollViewRef = useRef(null);
  const navigate = useNavigate();
  const [, startTransition] = useTransition();
  const { isXSmall, isLarge } = useScreenSize();
  const [patchCssClass, onMenuReady] = useMenuPatch();
  const [menuStatus, setMenuStatus] = useState(isLarge ? MenuStatus.Opened : MenuStatus.Closed);

  const toggleMenu = useCallback(({ event }) => {
    setMenuStatus(prevMenuStatus => prevMenuStatus === MenuStatus.Closed
      ? MenuStatus.Opened
      : MenuStatus.Closed);
    event.stopPropagation();
  }, []);

  const temporaryOpenMenu = useCallback(() => {
    setMenuStatus(prevMenuStatus => prevMenuStatus === MenuStatus.Closed
      ? MenuStatus.TemporaryOpened
      : prevMenuStatus);
  }, []);

  const onOutsideClick = useCallback(() => {
    setMenuStatus(prevMenuStatus => prevMenuStatus !== MenuStatus.Closed && !isLarge
      ? MenuStatus.Closed
      : prevMenuStatus);
    return menuStatus === MenuStatus.Closed ? true : false;
  }, [isLarge, menuStatus]);

  const onNavigationChanged = useCallback(({ itemData, event }) => {
    if (menuStatus === MenuStatus.Closed || !itemData.path) {
      event.preventDefault();
      return;
    }

    startTransition(() => navigate(itemData.path));
    scrollViewRef.current.instance.scrollTo(0);

    if (!isLarge || menuStatus === MenuStatus.TemporaryOpened) {
      setMenuStatus(MenuStatus.Closed);
      event.stopPropagation();
    }
  }, [navigate, menuStatus, isLarge]);

  return (
    <div className={'side-nav-inner-toolbar'}>
      <Drawer
        className={['drawer', patchCssClass].join(' ')}
        position={'before'}
        closeOnOutsideClick={onOutsideClick}
        openedStateMode={isLarge ? 'shrink' : 'overlap'}
        revealMode={isXSmall ? 'slide' : 'expand'}
        minSize={isXSmall ? 0 : 60}
        maxSize={250}
        shading={isLarge ? false : true}
        opened={menuStatus === MenuStatus.Closed ? false : true}
        template={'menu'}
      >
        <Header
          menuToggleEnabled={isXSmall}
          toggleMenu={toggleMenu}
        />

        <ScrollView ref={scrollViewRef} className={'layout-body with-footer'}>
          <div className={'content'}>
            {React.Children.map(children, (item) => {
              return item.type !== Footer && item;
            })}
          </div>
          <div className={'content-block'}>
            {React.Children.map(children, (item) => {
              return item.type === Footer && item;
            })}
          </div>
        </ScrollView>

        <Template name={'menu'}>
          <SideNavigationMenu
            status={status}
            compactMode={menuStatus === MenuStatus.Closed}
            selectedItemChanged={onNavigationChanged}
            openMenu={temporaryOpenMenu}
            onMenuReady={onMenuReady}
          >
            <Toolbar id={'navigation-header'}>
              {
                !isXSmall &&
                <Item
                  location={'before'}
                  cssClass={'menu-button'}
                >
                  <Button icon="menu" stylingMode="text" onClick={toggleMenu} />
                </Item>
              }
              <Item location={'before'} cssClass={'header-title'}  >
                <Link to="/" className="navbar-brand">
                  <img src={vtwPng} alt="" />
                </Link>
              </Item>
            </Toolbar>
          </SideNavigationMenu>
        </Template>
      </Drawer>
    </div>
  );
}

const MenuStatus = {
  Closed: 1,
  Opened: 2,
  TemporaryOpened: 3
};
