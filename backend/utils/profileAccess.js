import { ObjectId } from "mongodb";

export function isMutualFriend(userA, userB) {
    if (!userA || !userB) {
        return false;
    }

    const userAId = String(userA._id);
    const userBId = String(userB._id);

    const aFollowsB = (userA.following || []).some(
        id => String(id) === userBId
    );

    const bFollowsA = (userB.following || []).some(
        id => String(id) === userAId
    );

    return aFollowsB && bFollowsA;
}

export function canViewProfileDetails(viewer, profileOwner) {
    if (!viewer || !profileOwner) {
        return false;
    }

    if (String(viewer._id) === String(profileOwner._id)) {
        return true;
    }

    if (viewer.role === "admin") {
        return true;
    }

    return isMutualFriend(viewer, profileOwner);
}