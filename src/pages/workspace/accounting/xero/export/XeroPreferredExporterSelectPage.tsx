import isEmpty from 'lodash/isEmpty';
import React, {useCallback, useMemo} from 'react';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import * as Connections from '@libs/actions/connections';
import {getAdminEmployees} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type CardListItem = ListItem & {
    value: string;
};

function XeroPreferredExporterSelectPage({policy}: WithPolicyConnectionsProps) {
    const {export: exportConfiguration} = policy?.connections?.xero?.config ?? {};
    const policyOwner = policy?.owner ?? '';
    const exporters = getAdminEmployees(policy);

    const policyID = policy?.id ?? '';
    const data: CardListItem[] = useMemo(() => {
        if (!isEmpty(policyOwner) && isEmpty(exporters)) {
            return [
                {
                    value: policyOwner,
                    text: policyOwner,
                    keyForList: policyOwner,
                    isSelected: true,
                },
            ];
        }
        return exporters?.reduce<CardListItem[]>((vendors, vendor) => {
            if (vendor.email) {
                vendors.push({
                    value: vendor.email,
                    text: vendor.email,
                    keyForList: vendor.email,
                    isSelected: exportConfiguration?.exporter === vendor.email,
                });
            }
            return vendors;
        }, []);
    }, [exportConfiguration, exporters, policyOwner]);

    const selectExporter = useCallback(
        (row: CardListItem) => {
            if (row.value !== exportConfiguration?.exporter) {
                Connections.updatePolicyConnectionConfig(policyID, CONST.POLICY.CONNECTIONS.NAME.XERO, CONST.XERO_CONFIG.EXPORT, {exporter: row.value});
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_XERO_EXPORT.getRoute(policyID));
        },
        [policyID, exportConfiguration],
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName={XeroPreferredExporterSelectPage.displayName}
            sections={[{data}]}
            listItem={RadioListItem}
            onSelectRow={selectExporter}
            initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_XERO_PREFERRED_EXPORTER_CONFIGURATION.getRoute(policyID))}
            title="workspace.xero.preferredExporter"
        />
    );
}

XeroPreferredExporterSelectPage.displayName = 'XeroPreferredExporterSelectPage';

export default withPolicyConnections(XeroPreferredExporterSelectPage);
