import React, {
  ComponentProps,
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
  Routes as RRRoutes,
} from "react-router";
import { NestedHistory } from "./history";
import { Link } from "./Link";
import { useNestedHistoryContext } from "./NativeRouter";
import { combineUrls, getChildrenWithProps } from "./utils";

type NativeRouteObject = RouteObject & {
  screen?: RouteObject["element"];
  children?: NativeRouteObject[];
};

// add screen param support to creating routes from children, minor change to RRcreateRoutesFromChildren
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
  history: NestedHistory
) => {
  let screenRoutes: NativeRouteObject[] = [];
  const parentHistory = history.prefixes[parentPathnameBase];
  // TODO: ADD SUPPORT FOR MULTIPLE LEVELS
  parentHistory.segments
    .slice(0, parentHistory.index + 1)
    .map((segment) =>
      routes.find((r) => r.path?.replaceAll(/(\*|\/)+/g, "") === segment)
    )
    .filter((r) => !!r)
    .forEach((route) => {
      const r = route as NativeRouteObject; // we can assert because of filter
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
  return screenRoutes;
};

const StackRoutes: FC<ComponentProps<typeof RRRoutes>> = ({ children }) => {
  const { history, undo } = useNestedHistoryContext();
  const routes = createRoutesFromChildren(children);

  let { matches: parentMatches } = React.useContext(UNSAFE_RouteContext);
  let routeMatch = parentMatches[parentMatches.length - 1];
  let parentPathnameBase = routeMatch ? routeMatch.pathnameBase : "/";
  let parentPathname = routeMatch ? routeMatch.pathname : "/";

  let parentRoute = routeMatch && routeMatch.route;

  let location = useLocation();

  // console.warn(parentPathnameBase);

  // add location arg parsing

  let pathname = location.pathname || "/";
  let remainingPathname =
    parentPathnameBase === "/"
      ? pathname
      : pathname.slice(parentPathnameBase.length) || "/";

  const flattenedRoutes = screensFromRoutes(
    routes,
    `/${parentPathnameBase.replaceAll(/(\/|\*)*$/g, "")}`, // QUESTION: how should we approach stars at the ends of URLs?
    history
  );
  // console.log(flattenedRoutes);

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
              {r.screen}
            </UNSAFE_RouteContext.Provider>
            <Text>{JSON.stringify(flattenedRoutes.map((f) => f.path))}</Text>
          </View>
          <ScreenStackHeaderConfig title={r.path} />
        </Screen>
      ))}
    </ScreenStack>
  );
};

const TabsRoutes = ({ children }: ComponentProps<typeof RRRoutes>) => {
  const { history, undo } = useNestedHistoryContext();
  const routes = createRoutesFromChildren(children);
  let { matches: parentMatches } = React.useContext(UNSAFE_RouteContext);
  let routeMatch = parentMatches[parentMatches.length - 1];
  let parentPathnameBase = routeMatch ? routeMatch.pathnameBase : "/";
  const basenamePrefix = `/${parentPathnameBase.replaceAll(/(\/|\*)*$/g, "")}`;
  const parentHistory = history.prefixes[basenamePrefix];
  const currentSegment = parentHistory.segments[parentHistory.index];
  console.log({
    currentSegment,
    parentHistory,
    parentPathnameBase,
    routes: routes.map((r) => r.path),
    routess: routes.map((r) => r.path?.split("/")[0]),
  });
  return (
    <View style={{ flex: 1 }}>
      {/* <ScreenContainer style={{ flex: 1 }}> */}
      {routes.map(
        (r) =>
          r.path?.split("/").filter((f) => !!f)[0] === currentSegment && (
            // <Screen activityState={2}>

            <View
              style={{
                padding: 30,
                maxHeight: 500,
                margin: 20,
              }}
            >
              <UNSAFE_RouteContext.Provider
                value={{ matches: [{ pathnameBase: r.path || "/" }] }}
              >
                {r.screen}
              </UNSAFE_RouteContext.Provider>
            </View>
            // </Screen>
          )
      )}
      {/* </ScreenContainer> */}
      <View style={{ height: 90, flexDirection: "row", width: "100%" }}>
        {routes.map((r) => (
          <View style={{ flexGrow: 1, borderWidth: 1 }}>
            <Link
              to={`/${combineUrls(parentPathnameBase, r.path).replaceAll(
                "/*",
                ""
              )}`}
            >
              {r.path} -{" "}
              {combineUrls(parentPathnameBase, r.path).replaceAll("/*", "")}
            </Link>
          </View>
        ))}
      </View>
    </View>
  );
};

// renders a stack navigator or tabs navigator or basic switch navigator
// can also render a tab navigator
const Routes = (
  props: ComponentProps<typeof RRRoutes> & { stack?: boolean; tabs?: boolean }
) => {
  if (props.stack) {
    return <StackRoutes {...props} />;
  }
  if (props.tabs) {
    return <TabsRoutes {...props} />;
  }
  return <RRRoutes {...props} />;
};

export default Routes;
