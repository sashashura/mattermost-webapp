// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useIntl} from 'react-intl';
import {useSelector, useDispatch} from 'react-redux';

import Markdown from 'components/markdown';

import useOpenPricingModal from 'components/common/hooks/useOpenPricingModal';
import {Post} from '@mattermost/types/posts';
import {getUsers} from 'mattermost-redux/selectors/entities/users';
import useOpenCloudPurchaseModal from 'components/common/hooks/useOpenCloudPurchaseModal';
import {openModal} from 'actions/views/modals';
import LearnMoreTrialModal from 'components/learn_more_trial_modal/learn_more_trial_modal';
import {ModalIdentifiers, NonAdminPaidFeatures} from 'utils/constants';

const MinimumPlansForFeature = {
    Professional: 'Professional plan',
    Enterprise: 'Enterprise plan',
};

type FeatureRequest = {
    id: string;
    user_id: string;
    required_feature: string;
    required_plan: string;
    create_at: string;
    trial: string;
}

type RequestedFeature = Record<string, FeatureRequest[]>

type CustomPostProps = {
    requested_features: RequestedFeature;
    trial: boolean;
}

const style = {
    display: 'flex',
    gap: '10px',
    padding: '12px',
    borderRadius: '4px',
    border: '1px solid rgba(var(--center-channel-text-rgb), 0.16)',
    width: 'max-content',
    margin: '10px 0',
};

const btnStyle = {
    background: 'var(--button-bg)',
    color: 'var(--button-color)',
    border: 'none',
    borderRadius: '4px',
    padding: '8px 20px',
    fontWeight: 600,
};

const messageStyle = {
    marginBottom: '16px',
};

export default function OpenPricingModalPost(props: {post: Post}) {
    let allProfessional = true;

    const dispatch = useDispatch();
    const userProfiles = useSelector(getUsers);

    const openPurchaseModal = useOpenCloudPurchaseModal({});
    const {formatMessage} = useIntl();

    const openPricingModal = useOpenPricingModal();

    const postProps = props.post.props as Partial<CustomPostProps>;
    const requestFeatures = postProps?.requested_features;
    const wasTrialRequest = postProps?.trial;

    const customMessageBody = [];
    const getUserIdsForUsersThatRequestedFeature = (requests: FeatureRequest[]): string[] => {
        const userIds: string[] = [];
        requests.forEach((request: FeatureRequest) => {
            userIds.push(request.user_id);
        });

        return userIds;
    };

    const getUserNamesForUsersThatRequestedFeature = (requests: FeatureRequest[]): string[] => {
        const userNames: string[] = [];
        getUserIdsForUsersThatRequestedFeature(requests).forEach((userId: string) => {
            const profile = userProfiles[userId];
            if (profile === undefined) {
                userNames.push(formatMessage({id: 'postypes.custom_open_pricing_modal_post_renderer.unknown', defaultMessage: '@unknown'}));
            } else {
                userNames.push('@' + profile?.username);
            }
        });

        return userNames;
    };

    const renderUsersThatRequestedFeature = (requests: FeatureRequest[]) => {
        if (requests.length >= 5) {
            return formatMessage({
                id: 'postypes.custom_open_pricing_modal_post_renderer.members',
                defaultMessage: '{members} members'},
            {members: requests.length});
        }

        let renderedUsers;

        const users = getUserNamesForUsersThatRequestedFeature(requests);

        if (users.length === 1) {
            renderedUsers = users[0];
        } else {
            const lastUser = users.splice(-1, 1)[0];
            users.push(formatMessage({id: 'postypes.custom_open_pricing_modal_post_renderer.and', defaultMessage: 'and '}) + lastUser);
            renderedUsers = users.join(', ').replace(/,([^,]*)$/, '$1');
        }

        return renderedUsers;
    };

    const markDownOptions = {
        atSumOfMembersMentions: true,
        atPlanMentions: true,
        markdown: false,
    };

    const mapFeatureToPlan = (feature: string) => {
        switch (feature) {
        case NonAdminPaidFeatures.GUEST_ACCOUNTS:
        case NonAdminPaidFeatures.CREATE_MULTIPLE_TEAMS:
            return MinimumPlansForFeature.Professional;
        case NonAdminPaidFeatures.ALL_ENTERPRISE_FEATURES:
        case NonAdminPaidFeatures.CUSTOM_USER_GROUPS:
            allProfessional = false;
            return MinimumPlansForFeature.Enterprise;
        default:
            return MinimumPlansForFeature.Professional;
        }
    };

    if (requestFeatures) {
        for (const featureName of Object.keys(requestFeatures)) {
            const title = (
                <div id={`${featureName}-title`.replaceAll(' ', '-')}>
                    <span>
                        <b>
                            {`${featureName}`}
                        </b>
                    </span>
                    <span>
                        <Markdown
                            message={formatMessage({id: 'postypes.custom_open_pricing_modal_post_renderer.availableOn', defaultMessage: ' - available on the {feature}'}, {feature: mapFeatureToPlan(featureName)})}
                            options={{...markDownOptions, atSumOfMembersMentions: false}}
                        />
                    </span>
                </div>);
            const subTitle = (
                <ul id={`${featureName}-subtitle`.replaceAll(' ', '-')}>
                    <li>
                        <Markdown
                            postId={props.post.id}
                            message={formatMessage({id: 'postypes.custom_open_pricing_modal_post_renderer.userRequests', defaultMessage: '{userRequests} requested access to this feature'}, {userRequests: renderUsersThatRequestedFeature(requestFeatures[featureName])})}
                            options={markDownOptions}
                            userIds={getUserIdsForUsersThatRequestedFeature(requestFeatures[featureName])}
                            messageMetadata={{requestedFeature: featureName}}
                        />
                    </li>
                </ul>);

            const featureMessage = (
                <div style={messageStyle}>
                    {title}
                    {subTitle}
                </div>
            );

            customMessageBody.push(featureMessage);
        }
    }

    const openLearnMoreTrialModal = () => {
        dispatch(openModal({
            modalId: ModalIdentifiers.LEARN_MORE_TRIAL_MODAL,
            dialogType: LearnMoreTrialModal,
        }));
    };

    const renderButtons = () => {
        if (wasTrialRequest) {
            return (
                <>
                    <button
                        id='learn_more_about_trial'
                        onClick={openLearnMoreTrialModal}
                        style={btnStyle}
                    >
                        {formatMessage({id: 'postypes.custom_open_pricing_modal_post_renderer.learn_trial', defaultMessage: 'Learn more about trial'})}
                    </button>
                    <button
                        onClick={() => openPricingModal({trackingLocation: 'notify_admin_message_view_upgrade_options'})}
                        style={{...btnStyle, color: 'var(--button-bg)', background: 'rgba(var(--denim-button-bg-rgb), 0.08)'}}
                    >
                        {formatMessage({id: 'postypes.custom_open_pricing_modal_post_renderer.view_options', defaultMessage: 'View upgrade options'})}
                    </button>
                </>
            );
        }

        if (allProfessional) {
            return (
                <>
                    <button
                        id='upgrade_to_professional'
                        onClick={() => openPurchaseModal({trackingLocation: 'notify_admin_message_view'})}
                        style={btnStyle}
                    >
                        {formatMessage({id: 'postypes.custom_open_pricing_modal_post_renderer.upgrade_professional', defaultMessage: 'Upgrade to Professional'})}
                    </button>
                    <button
                        id='view_upgrade_options'
                        onClick={() => openPricingModal({trackingLocation: 'notify_admin_message_view_upgrade_options'})}
                        style={{...btnStyle, color: 'var(--button-bg)', background: 'rgba(var(--denim-button-bg-rgb), 0.08)'}}
                    >
                        {formatMessage({id: 'postypes.custom_open_pricing_modal_post_renderer.view_options', defaultMessage: 'View upgrade options'})}
                    </button>
                </>
            );
        }
        return (
            <button
                id='view_upgrade_options'
                onClick={() => openPricingModal({trackingLocation: 'notify_admin_message_view_upgrade_options'})}
                style={{...btnStyle, border: '1px solid var(--button-bg)', color: 'var(--button-bg)', background: 'var(--sidebar-text)'}}
            >
                {formatMessage({id: 'postypes.custom_open_pricing_modal_post_renderer.view_options', defaultMessage: 'View upgrade options'})}
            </button>);
    };

    return (
        <div>
            <div style={messageStyle}>
                <Markdown
                    message={props.post.message}
                    options={{...markDownOptions, atSumOfMembersMentions: false}}
                />
            </div>
            {customMessageBody}
            <div style={{display: 'flex'}}>
                <div
                    style={style}
                >
                    {renderButtons()}
                </div>
            </div>
        </div>
    );
}
