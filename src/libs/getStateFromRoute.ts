// eslint-disable-next-line you-dont-need-lodash-underscore/get
import lodashGet from 'lodash/get';
import {CONST as COMMON_CONST} from 'expensify-common/lib/CONST';

type RouteProps = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params?: Record<string, any>;
};

export default function getStateFromRoute(route: RouteProps, stateParamName = 'state'): string {
    const stateFromUrlTemp = lodashGet(route, `params.${stateParamName}`) as unknown as string;
    // check if state is valid
    return lodashGet(COMMON_CONST.STATES, stateFromUrlTemp) ? stateFromUrlTemp : '';
}
