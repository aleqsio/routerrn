import React, {
  FC,
  Fragment,
  isValidElement,
  ReactChildren,
  ReactNode,
} from "react";
import { Text, View } from "react-native";
import {
  NativeScreenNavigationContainer,
  Screen,
  ScreenContainer,
  ScreenStack,
  ScreenStackHeaderConfig,
} from "react-native-screens";
import {
  useRoutes,
  createRoutesFromChildren as RRcreateRoutesFromChildren,
  matchPath,
  useLocation,
  UNSAFE_RouteContext,
  renderMatches,
  matchRoutes,
  Route,
  RouteObject,
} from "react-router";
import { NestedHistory } from "./history";
import { useNestedHistoryContext } from "./NativeRouter";
import { combineUrls, getChildrenWithProps } from "./utils";

type NativeRouteObject = RouteObject & { screen: boolean };

const createRoutesFromChildren: (children: ReactNode) => NativeRouteObject[] = (
  children
) => {
  let routes: NativeRouteObject[] = [];
  React.Children.forEach(children, (element) => {
    if (!(/*#__PURE__*/ isValidElement(element))) {
      // Ignore non-elements. This allows people to more easily inline
      // conditionals in their route config.
      return;
    }

    if (element.type === Fragment) {
      // Transparently support React.Fragment and its children.
      routes.push.apply(
        routes,
        createRoutesFromChildren(element.props.children)
      );
      return;
    }

    let route = {
      caseSensitive: element.props.caseSensitive,
      element: element.props.element,
      index: element.props.index,
      path: element.props.path,
      screen: element.props.screen,
    };

    if (element.props.children) {
      (route as any).children = createRoutesFromChildren(
        element.props.children
      );
    }

    routes.push(route);
  });
  return routes;
};

const screensFromRoutes = (
  // to be used on Routes type = stack
  routes: NativeRouteObject[],
  parentPathnameBase: string,
  history: NestedHistory,
  tag: string
) => {
  let screenRoutes: NativeRouteObject[] = [];
  const parentHistory = history.prefixes[parentPathnameBase];
  // console.log({ routes, parentPathnameBase, history, parentHistory });
  console.log({
    tag,
    s: parentHistory.segments.slice(0, parentHistory.index + 1),
    r: routes,
    parentPathnameBase,
  });
  // ADD SUPPORT FOR MULTIPLE LEVELS
  parentHistory.segments
    .slice(0, parentHistory.index + 1)
    .map((segment) =>
      routes.find((r) => r.path?.replaceAll(/(\*|\/)+/g, "") === segment)
    )
    .filter((r) => !!r)
    .forEach((route) => {
      const r = route as NativeRouteObject;
      if (r.screen) {
        screenRoutes.push(r);
        if (r.children) {
          screenRoutes.push(
            ...screensFromRoutes(
              r.children,
              combineUrls(parentPathnameBase, r.path),
              history
            )
          );
        }
      }
    });
  console.log({ screenRoutes });
  return screenRoutes;
};

// renders a stack navigator if no navigator is found to plug into
// can also render a tab navigator
const Routes: FC<{ tag: string }> = ({ children, tag }) => {
  const { pathname } = useLocation();
  const { history, undo } = useNestedHistoryContext();
  const routes = createRoutesFromChildren(children);

  let { matches: parentMatches } = React.useContext(UNSAFE_RouteContext);
  let routeMatch = parentMatches[parentMatches.length - 1];
  let parentPathname = routeMatch ? routeMatch.pathname : "/";
  let parentPathnameBase = routeMatch ? routeMatch.pathnameBase : "/";
  const flattenedRoutes = screensFromRoutes(
    routes,
    `/${parentPathnameBase.replaceAll(/(\/|\*)*$/g, "")}`,
    history,
    tag
  );
  console.log(flattenedRoutes);

  // console.log({ tag, flattenedRoutes });
  // let parentParams = routeMatch ? routeMatch.params : {};

  // let parentRoute = routeMatch && routeMatch.route;
  // let remainingPathname =
  //   parentPathnameBase === "/"
  //     ? pathname
  //     : pathname.slice(parentPathnameBase.length) || "/";
  // // console.log({ prefixes: history.prefixes[pathname] });
  // console.log(tag, {
  //   parentPathnameBase,
  //   parentPathname,
  //   remainingPathname,
  //   routes,
  //   history,
  //   routeMatch,
  //   parentMatches,
  // });
  const prefix = history.prefixes[parentPathnameBase];
  // console.log(prefix);
  // const matchesForEachHistoryObject = prefix.segments.matchRoutes(routes);

  // return useRoutes(createRoutesFromChildren(children));
  // return renderMatches(
  //   matches &&
  //     matches.map((match) =>
  //       Object.assign({}, match, {
  //         params: Object.assign({}, parentParams, match.params),
  //         pathname: joinPaths([parentPathnameBase, match.pathname]),
  //         pathnameBase:
  //           match.pathnameBase === "/"
  //             ? parentPathnameBase
  //             : joinPaths([parentPathnameBase, match.pathnameBase]),
  //       })
  //     ),
  //   parentMatches
  // );
  if (flattenedRoutes.length === 0) return null;
  return (
    <ScreenStack
      style={{ flex: 1, alignSelf: "stretch", backgroundColor: "red" }}
    >
      {flattenedRoutes.map((r, idx) => (
        <Screen
          key={`${r.path}${idx}`}
          onWillDisappear={() => {
            if (idx === flattenedRoutes.length - 1) {
              undo();
            }
          }}
        >
          <View style={{ paddingTop: 120 }}>
            <UNSAFE_RouteContext.Provider
              value={{ matches: [{ pathnameBase: r.path || "/" }] }}
            >
              {r.element}
            </UNSAFE_RouteContext.Provider>
            <Text>{JSON.stringify(flattenedRoutes.map((f) => f.path))}</Text>
          </View>
          <ScreenStackHeaderConfig title={r.path} />
        </Screen>
      ))}
    </ScreenStack>
  );
};
export default Routes;
