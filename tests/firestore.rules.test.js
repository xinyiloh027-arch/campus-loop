import { readFileSync } from 'node:fs';
import { beforeAll, afterAll, describe, it } from 'vitest';
import {
  	initializeTestEnvironment,
	assertFails,
	assertSucceeds,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, writeBatch } from 'firebase/firestore';

let testEnv;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-campusloop',
    firestore: {
      host: '127.0.0.1',
      port: 8080,
      rules: readFileSync(
        new URL('../firestore.rules', import.meta.url),
        'utf8'
      ),
    },
  });
});

afterAll(async () => {
  if (testEnv) {
    await testEnv.cleanup();
  }
});


describe('CampusLoop Firestore Security Rules', () => {
  
it('should allow a verified buyer to notify the actual seller of a trade', async () => {
  const buyerId = 'verified-buyer-001';
  const sellerId = 'verified-seller-001';
  const tradeId = 'test-trade-notification-001';
  const listingId = 'test-listing-001';

  // Create a trade using admin privileges for test setup.
  await testEnv.withSecurityRulesDisabled(async (context) => {
  const adminDb = context.firestore();
  const tradeRef = doc(adminDb, `trades/${tradeId}`);

  

await setDoc(tradeRef, {
  buyerId,
  sellerId,
  listingId,
});
  const check = await getDoc(tradeRef);

  if (!check.exists()) {
  throw new Error('DIAGNOSTIC: Trade document was not created.');
}

if (
  check.data().buyerId !== buyerId ||
  check.data().sellerId !== sellerId
) {
  throw new Error(
    'DIAGNOSTIC: Trade document has incorrect buyerId or sellerId: ' +
    JSON.stringify(check.data())
  );
}

console.log('DIAGNOSTIC: Trade document exists and IDs are correct.');
});

  const db = testEnv
    .authenticatedContext(buyerId, {
      email: 'buyer@student.utm.my',
      email_verified: true,
    })
    .firestore();
// Confirm the buyer can read the trade document.
await assertSucceeds(
  getDoc(doc(db, `trades/${tradeId}`))
);

console.log('BUYER CAN READ TRADE DOCUMENT');

  await assertSucceeds(
    setDoc(doc(db, `notifications/test-seller-notification-${Date.now()}`), {
     recipientId: sellerId,
     senderId: buyerId,
  buyerId,
  sellerId,
  type: 'purchase_request',
  title: 'New purchase request',
  message: 'A buyer is interested in your item.',
  relatedRequestId: tradeId,
  relatedListingId: listingId,
  isRead: false,
  createdAt: new Date().toISOString(),
    })
  );
});

it('should block a buyer from notifying an unrelated user about a trade', async () => {
  const buyerId = 'verified-buyer-002';
  const sellerId = 'verified-seller-002';
  const unrelatedUserId = 'unrelated-user-001';
  const tradeId = 'test-trade-notification-002';

  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), `trades/${tradeId}`), {
  buyerId,
  sellerId,
  listingId: 'test-listing-002',
    });
  });

  const db = testEnv
    .authenticatedContext(buyerId, {
      email: 'buyer2@student.utm.my',
      email_verified: true,
    })
    .firestore();

  await assertFails(
    setDoc(doc(db, 'notifications/test-invalid-notification-001'), {
      recipientId: unrelatedUserId,
  senderId: buyerId,
  buyerId,
  sellerId,
  type: 'purchase_request',
  title: 'New purchase request',
  message: 'A buyer is interested in your item.',
  relatedRequestId: tradeId,
  relatedListingId: 'test-listing-002',
  isRead: false,
  createdAt: new Date().toISOString(),
    })
  );
});

  
  it('should block a buyer from forging the seller ID in a notification', async () => {
    const buyerId = 'verified-buyer-003';
    const sellerId = 'verified-seller-003';
    const forgedSellerId = 'fake-seller-003';
    const tradeId = 'test-trade-notification-003';
    const listingId = 'test-listing-003';

    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), `trades/${tradeId}`), {
        buyerId,
        sellerId,
        listingId,
      });
    });

    const db = testEnv
      .authenticatedContext(buyerId, {
        email: 'buyer3@student.utm.my',
        email_verified: true,
      })
      .firestore();

    await assertFails(
      setDoc(doc(db, 'notifications/test-forged-seller-001'), {
        recipientId: forgedSellerId,
        senderId: buyerId,
        buyerId,
        sellerId: forgedSellerId,
        type: 'purchase_request',
        title: 'New purchase request',
        message: 'A buyer is interested in your item.',
        relatedRequestId: tradeId,
        relatedListingId: listingId,
        isRead: false,
        createdAt: new Date().toISOString(),
      })
    );
  });

  
  it('should block a notification with an incorrect listing ID', async () => {
    const buyerId = 'verified-buyer-004';
    const sellerId = 'verified-seller-004';
    const tradeId = 'test-trade-notification-004';
    const actualListingId = 'test-listing-004';
    const incorrectListingId = 'wrong-listing-004';

    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), `trades/${tradeId}`), {
        buyerId,
        sellerId,
        listingId: actualListingId,
      });
    });

    const db = testEnv
      .authenticatedContext(buyerId, {
        email: 'buyer4@student.utm.my',
        email_verified: true,
      })
      .firestore();

    await assertFails(
      setDoc(doc(db, 'notifications/test-wrong-listing-001'), {
        recipientId: sellerId,
        senderId: buyerId,
        buyerId,
        sellerId,
        type: 'purchase_request',
        title: 'New purchase request',
        message: 'A buyer is interested in your item.',
        relatedRequestId: tradeId,
        relatedListingId: incorrectListingId,
        isRead: false,
        createdAt: new Date().toISOString(),
      })
    );
  });

  
  
  it('should allow a verified buyer to declare payment and notify the actual seller', async () => {
    const buyerId = 'payment-buyer-001';
    const sellerId = 'payment-seller-001';
    const tradeId = 'payment-trade-001';
    const listingId = 'payment-listing-001';
    const now = new Date().toISOString();

    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), `trades/${tradeId}`), {
        buyerId,
        sellerId,
        listingId,
        status: 'Chat / Payment Arrangement',
        createdAt: now,
        offeredPrice: 10,
        quantity: 2,
        totalPrice: 20,
      });
    });

    const db = testEnv.authenticatedContext(buyerId, {
      email: 'buyer@student.utm.my',
      email_verified: true,
    }).firestore();

    const batch = writeBatch(db);

    batch.update(doc(db, `trades/${tradeId}`), {
      status: 'Payment Under Review',
      paymentDeclaredAt: now,
      paymentMethod: 'DuitNow QR',
    });

    batch.set(doc(db, 'notifications/payment-declared-valid-001'), {
      recipientId: sellerId,
      senderId: buyerId,
      buyerId,
      sellerId,
      type: 'payment_declared',
      title: 'Buyer Declared Payment',
      message: 'Please independently check your account.',
      isRead: false,
      read: false,
      createdAt: now,
      relatedRequestId: tradeId,
      relatedListingId: listingId,
      linkTab: 'me',
    });

    await assertSucceeds(batch.commit());
  });

  it('should block forged IDs and unrelated recipients in payment declarations', async () => {
    const buyerId = 'payment-buyer-002';
    const sellerId = 'payment-seller-002';
    const unrelatedUserId = 'payment-unrelated-002';
    const tradeId = 'payment-trade-002';
    const listingId = 'payment-listing-002';
    const now = new Date().toISOString();

    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), `trades/${tradeId}`), {
        buyerId,
        sellerId,
        listingId,
        status: 'Chat / Payment Arrangement',
        createdAt: now,
        offeredPrice: 10,
        quantity: 2,
        totalPrice: 20,
      });
    });

    const db = testEnv.authenticatedContext(buyerId, {
      email: 'buyer2@student.utm.my',
      email_verified: true,
    }).firestore();

    const attemptDeclaration = (notificationId, overrides = {}) => {
      const batch = writeBatch(db);

      batch.update(doc(db, `trades/${tradeId}`), {
        status: 'Payment Under Review',
        paymentDeclaredAt: now,
        paymentMethod: 'DuitNow QR',
      });

      batch.set(doc(db, `notifications/${notificationId}`), {
        recipientId: sellerId,
        senderId: buyerId,
        buyerId,
        sellerId,
        type: 'payment_declared',
        title: 'Buyer Declared Payment',
        message: 'Please independently check your account.',
        isRead: false,
        read: false,
        createdAt: now,
        relatedRequestId: tradeId,
        relatedListingId: listingId,
        linkTab: 'me',
        ...overrides,
      });

      return batch.commit();
    };

    await assertFails(
      attemptDeclaration('payment-forged-buyer-002', {
        buyerId: 'forged-buyer-002',
      })
    );

    await assertFails(
      attemptDeclaration('payment-forged-seller-002', {
        sellerId: 'forged-seller-002',
      })
    );

    await assertFails(
      attemptDeclaration('payment-forged-listing-002', {
        relatedListingId: 'forged-listing-002',
      })
    );

    await assertFails(
      attemptDeclaration('payment-unrelated-recipient-002', {
        recipientId: unrelatedUserId,
      })
    );
  });

  it('should allow the actual seller to confirm payment, deduct stock and notify the buyer', async () => {
    const buyerId = 'payment-buyer-003';
    const sellerId = 'payment-seller-003';
    const tradeId = 'payment-trade-003';
    const listingId = 'payment-listing-003';
    const now = new Date().toISOString();

    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();

      await setDoc(doc(adminDb, `trades/${tradeId}`), {
        buyerId,
        sellerId,
        listingId,
        status: 'Payment Under Review',
        createdAt: now,
        offeredPrice: 10,
        quantity: 2,
        totalPrice: 20,
        paymentDeclaredAt: now,
        paymentMethod: 'DuitNow QR',
      });

      await setDoc(doc(adminDb, `listings/${listingId}`), {
        sellerId,
        title: 'Test textbook',
        price: 10,
        status: 'Active',
        createdAt: now,
        originalQuantity: 5,
        remainingQuantity: 5,
      });
    });

    const db = testEnv.authenticatedContext(sellerId, {
      email: 'seller@student.utm.my',
      email_verified: true,
    }).firestore();

    const batch = writeBatch(db);

    batch.update(doc(db, `trades/${tradeId}`), {
      status: 'Approved',
      approvedAt: now,
    });

    batch.update(doc(db, `listings/${listingId}`), {
      remainingQuantity: 3,
      status: 'Active',
    });

    batch.set(doc(db, 'notifications/payment-received-valid-003'), {
      recipientId: buyerId,
      senderId: sellerId,
      buyerId,
      sellerId,
      type: 'payment_received',
      title: 'Payment Received',
      message: 'The seller confirmed receipt of your payment.',
      isRead: false,
      read: false,
      createdAt: now,
      relatedRequestId: tradeId,
      relatedListingId: listingId,
      linkTab: 'chat',
    });

    await assertSucceeds(batch.commit());

    const updatedTrade = await getDoc(doc(db, `trades/${tradeId}`));
    const updatedListing = await getDoc(doc(db, `listings/${listingId}`));

    if (updatedTrade.data().status !== 'Approved') {
      throw new Error('Trade status was not updated.');
    }

    if (updatedListing.data().remainingQuantity !== 3) {
      throw new Error('Listing stock was not deducted correctly.');
    }
  });

  it('should block forged payment-received notification IDs', async () => {
    const buyerId = 'payment-buyer-004';
    const sellerId = 'payment-seller-004';
    const tradeId = 'payment-trade-004';
    const listingId = 'payment-listing-004';
    const now = new Date().toISOString();

    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();

      await setDoc(doc(adminDb, `trades/${tradeId}`), {
        buyerId,
        sellerId,
        listingId,
        status: 'Payment Under Review',
        createdAt: now,
        offeredPrice: 10,
        quantity: 2,
        totalPrice: 20,
        paymentDeclaredAt: now,
        paymentMethod: 'DuitNow QR',
      });

      await setDoc(doc(adminDb, `listings/${listingId}`), {
        sellerId,
        title: 'Test textbook',
        price: 10,
        status: 'Active',
        createdAt: now,
        originalQuantity: 5,
        remainingQuantity: 5,
      });
    });

    const db = testEnv.authenticatedContext(sellerId, {
      email: 'seller4@student.utm.my',
      email_verified: true,
    }).firestore();

    const attemptConfirmation = (notificationId, overrides = {}) => {
      const batch = writeBatch(db);

      batch.update(doc(db, `trades/${tradeId}`), {
        status: 'Approved',
        approvedAt: now,
      });

      batch.update(doc(db, `listings/${listingId}`), {
        remainingQuantity: 3,
        status: 'Active',
      });

      batch.set(doc(db, `notifications/${notificationId}`), {
        recipientId: buyerId,
        senderId: sellerId,
        buyerId,
        sellerId,
        type: 'payment_received',
        title: 'Payment Received',
        message: 'The seller confirmed receipt of your payment.',
        isRead: false,
        read: false,
        createdAt: now,
        relatedRequestId: tradeId,
        relatedListingId: listingId,
        linkTab: 'chat',
        ...overrides,
      });

      return batch.commit();
    };

    await assertFails(
      attemptConfirmation('payment-received-forged-buyer-004', {
        buyerId: 'forged-buyer-004',
      })
    );

    await assertFails(
      attemptConfirmation('payment-received-forged-seller-004', {
        sellerId: 'forged-seller-004',
      })
    );

    await assertFails(
      attemptConfirmation('payment-received-forged-listing-004', {
        relatedListingId: 'forged-listing-004',
      })
    );
  });



  it('should block verified UTM users with suspended auth claims', async () => {
    const db = testEnv
      .authenticatedContext('suspended-claim-user', {
        email: 'student@student.utm.my',
        email_verified: true,
        suspended: true,
      })
      .firestore();

    await assertFails(
      getDoc(doc(db, 'listings/test-listing'))
    );
  });

  it('should block users whose profile has isSuspended set to true', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();

      await setDoc(
        doc(adminDb, 'users/suspended-profile-user'),
        { isSuspended: true }
      );
    });

    const db = testEnv
      .authenticatedContext('suspended-profile-user', {
        email: 'student@student.utm.my',
        email_verified: true,
      })
      .firestore();

    await assertFails(
      getDoc(doc(db, 'listings/test-listing'))
    );
  });

  it('should block users whose accountState is Suspended', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();

      await setDoc(
        doc(adminDb, 'users/suspended-state-user'),
        { accountState: 'Suspended' }
      );
    });

    const db = testEnv
      .authenticatedContext('suspended-state-user', {
        email: 'student@student.utm.my',
        email_verified: true,
      })
      .firestore();

    await assertFails(
      getDoc(doc(db, 'listings/test-listing'))
    );
  });
  it('should block unauthenticated users from reading listings', async () => {
    const db = testEnv.unauthenticatedContext().firestore();

    await assertFails(
      getDoc(doc(db, 'listings/test-listing'))
    );
  });

  it('should block UTM users who have not verified their email', async () => {
    const db = testEnv
      .authenticatedContext('unverified-student', {
        email: 'student@student.utm.my',
        email_verified: false,
      })
      .firestore();

    await assertFails(
      getDoc(doc(db, 'listings/test-listing'))
    );
  });

  
  it('should allow verified UTM users to read listings', async () => {
    const db = testEnv
      .authenticatedContext('verified-student', {
        email: 'student@student.utm.my',
        email_verified: true,
      })
      .firestore();

    await assertSucceeds(
      getDoc(doc(db, 'listings/test-listing'))
    );
  });

  it('should allow verified UTM users to create their own listing', async () => {
    const userId = 'verified-seller-001';

    const db = testEnv
      .authenticatedContext(userId, {
        email: 'seller@student.utm.my',
        email_verified: true,
      })
      .firestore();
	
    await assertSucceeds(
	getDoc(doc(db, 'listings/test-listing'))
    );

    await assertSucceeds(
      setDoc(doc(db, `listings/test-create-listing-${Date.now()}`), {
        title: 'Test Textbook',
        description: 'A second-hand textbook for testing.',
        price: 10,
        category: 'Books',
        condition: 'Good',
        sellerId: userId,
        sellerName: 'Test Seller',
        status: 'Active',
        createdAt: new Date(),
      })
    );

  });

  it('should block users from creating listings under another seller ID', async () => {
    const userId = 'attacker-user-001';

    const db = testEnv
      .authenticatedContext(userId, {
        email: 'attacker@student.utm.my',
        email_verified: true,
      })
      .firestore();

    await assertFails(
      setDoc(doc(db, 'listings/unauthorized-listing-001'), {
        title: 'Unauthorized Listing',
        description: 'Testing seller ID protection.',
        price: 10,
        category: 'Books',
        condition: 'Good',
        sellerId: 'another-student-001',
        sellerName: 'Another Student',
        status: 'Active',
        createdAt: new Date(),
      })
    );
  });

});
  