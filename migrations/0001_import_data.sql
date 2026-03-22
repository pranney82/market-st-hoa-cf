PRAGMA foreign_keys = OFF;
INSERT OR IGNORE INTO households (id, address, unit_number, primary_contact_id, notes, is_active, created_at, updated_at, moving_status, moving_date) VALUES ('7c55e37d-d43a-430f-97fc-209693c541a7', '663 Market Street', NULL, 'local_1763501156174_uqbgbo', NULL, 1, '2025-11-19T02:57:58.220Z', '2025-11-19T02:57:58.220Z', NULL, NULL);
INSERT OR IGNORE INTO users (id, email, first_name, last_name, profile_image_url, role, position, unit_number, phone_number, local_password_hash, email_notifications, created_at, updated_at, address, emergency_contact, kids, pets, autopay_enabled, autopay_card_token, autopay_card_last4, autopay_card_type, autopay_card_expiry, announcement_notifications, event_notifications, spouse_partner_name, spouse_partner_phone, spouse_partner_email, household_id, emergency_contact_name, emergency_contact_phone, emergency_contact_is_spouse, moving_status, moving_date, member_status, departed_at, departure_notes, autopay_method, autopay_bank_token, autopay_bank_last4, autopay_bank_name, autopay_bank_type) VALUES ('dev-admin@marketstreethoa.com', 'dev-admin@marketstreethoa.com', NULL, NULL, NULL, 'admin', NULL, NULL, NULL, NULL, 1, '2025-11-12T04:26:53.893Z', '2025-11-13T01:21:40.013Z', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, 1, 1, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT OR IGNORE INTO users (id, email, first_name, last_name, profile_image_url, role, position, unit_number, phone_number, local_password_hash, email_notifications, created_at, updated_at, address, emergency_contact, kids, pets, autopay_enabled, autopay_card_token, autopay_card_last4, autopay_card_type, autopay_card_expiry, announcement_notifications, event_notifications, spouse_partner_name, spouse_partner_phone, spouse_partner_email, household_id, emergency_contact_name, emergency_contact_phone, emergency_contact_is_spouse, moving_status, moving_date, member_status, departed_at, departure_notes, autopay_method, autopay_bank_token, autopay_bank_last4, autopay_bank_name, autopay_bank_type) VALUES ('local_1763501156174_uqbgbo', 'peterranney@gmail.com', 'Peter', 'Ranney', NULL, 'admin', NULL, '', '', '$2b$10$Gxj2yctmeS3itEEZIsuyQ.l2QLmFDYrGupfNHjMehCkHJo0SHbOh.', 1, '2025-11-19T02:25:56.299Z', '2025-12-12T20:09:52.422Z', '663 Market Street', '', '[]', '[]', 0, NULL, NULL, NULL, NULL, 1, 1, '', '', '', '7c55e37d-d43a-430f-97fc-209693c541a7', NULL, NULL, 0, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT OR IGNORE INTO users (id, email, first_name, last_name, profile_image_url, role, position, unit_number, phone_number, local_password_hash, email_notifications, created_at, updated_at, address, emergency_contact, kids, pets, autopay_enabled, autopay_card_token, autopay_card_last4, autopay_card_type, autopay_card_expiry, announcement_notifications, event_notifications, spouse_partner_name, spouse_partner_phone, spouse_partner_email, household_id, emergency_contact_name, emergency_contact_phone, emergency_contact_is_spouse, moving_status, moving_date, member_status, departed_at, departure_notes, autopay_method, autopay_bank_token, autopay_bank_last4, autopay_bank_name, autopay_bank_type) VALUES ('39886143', 'peter@contractorcto.com', 'Peter', 'Ranney', NULL, 'admin', NULL, NULL, NULL, NULL, 1, '2025-11-13T02:18:24.781Z', '2025-11-13T02:18:24.781Z', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, 1, 1, NULL, NULL, NULL, '7c55e37d-d43a-430f-97fc-209693c541a7', NULL, NULL, 0, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT OR IGNORE INTO users (id, email, first_name, last_name, profile_image_url, role, position, unit_number, phone_number, local_password_hash, email_notifications, created_at, updated_at, address, emergency_contact, kids, pets, autopay_enabled, autopay_card_token, autopay_card_last4, autopay_card_type, autopay_card_expiry, announcement_notifications, event_notifications, spouse_partner_name, spouse_partner_phone, spouse_partner_email, household_id, emergency_contact_name, emergency_contact_phone, emergency_contact_is_spouse, moving_status, moving_date, member_status, departed_at, departure_notes, autopay_method, autopay_bank_token, autopay_bank_last4, autopay_bank_name, autopay_bank_type) VALUES ('csG04F', 'csG04F@example.com', 'Admin', 'User', NULL, 'admin', NULL, NULL, NULL, NULL, 1, '2025-12-30T22:24:29.494Z', '2025-12-30T22:24:29.494Z', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, 1, 1, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT OR IGNORE INTO password_reset_tokens (id, user_id, token_hash, expires_at, used, created_at) VALUES ('fbfb282d-ee42-4f1e-8ca3-9e44123f80e4', 'local_1763501156174_uqbgbo', 'd18db2f017c6a95352f9b9860d70b4e891564530d25f487a8bc06ab2e0d4a9a4', '2025-12-12T21:09:26.175Z', 1, '2025-12-12T20:09:26.202Z');
INSERT OR IGNORE INTO password_reset_tokens (id, user_id, token_hash, expires_at, used, created_at) VALUES ('e9c86957-b186-45c0-bdc0-cdf6eb00e768', 'dev-admin@marketstreethoa.com', 'd226e7d689c868826e2097b938503a5f43f9ce3929f6f9fcca1d01233c65b4a7', '2025-12-24T19:32:20.179Z', 0, '2025-12-24T18:32:20.215Z');
INSERT OR IGNORE INTO invitations (id, email, token, invited_by, status, expires_at, created_at, completed_at) VALUES ('aaeff1bf-1954-416e-9282-4a8153e5a52a', 'peterranney@gmail.com', '32cc66c3656496a2aea33d27d0136991e34cf3c7ecc265215a7608f883da9aa3', 'dev-admin@marketstreethoa.com', 'pending', '2025-11-20T00:13:24.888Z', '2025-11-13T00:13:24.926Z', NULL);
INSERT OR IGNORE INTO invitations (id, email, token, invited_by, status, expires_at, created_at, completed_at) VALUES ('7c968995-8bc4-48e7-a788-3bdebf19a6a0', 'peterranney@gmail.com', '56c7146f2a3fa53ce2ff100625f8dc5d6ac9522ef59952c093d1771c3b0eadba', 'dev-admin@marketstreethoa.com', 'pending', '2025-11-20T01:40:54.491Z', '2025-11-13T01:40:54.527Z', NULL);
INSERT OR IGNORE INTO invitations (id, email, token, invited_by, status, expires_at, created_at, completed_at) VALUES ('00c10c19-b19e-4164-89a7-9af3c3d6b40e', 'peterranney@gmail.com', 'daf87ac975b3239bd675e77bcc8cd1724c4abf61ba7c6b873aafe5d7c89ac3c4', '39886143', 'pending', '2025-11-20T02:28:16.699Z', '2025-11-13T02:28:16.734Z', NULL);
INSERT OR IGNORE INTO invitations (id, email, token, invited_by, status, expires_at, created_at, completed_at) VALUES ('f2ec09e1-9e3a-4b42-a818-74a6acdc026d', 'peterranney@gmail.com', '88a078c816b12c67d0f1369dacdbcef807b3fde50cade5360872cfe37f3c1ce8', '39886143', 'pending', '2025-11-20T08:15:29.055Z', '2025-11-13T08:15:29.092Z', NULL);
INSERT OR IGNORE INTO documents (id, file_name, file_size, mime_type, storage_path, category, tags, description, uploaded_by, is_public, version, created_at, updated_at) VALUES ('f7317aad-febb-4686-9592-b8f53af3d338', 'formation.pdf', '164804', 'application/pdf', '/tmp/documents/7fdf2752cdf86864ef8afab36cb4e6c8.pdf', 'Forms', '[]', NULL, '39886143', 1, '1', '2025-11-13T06:54:47.405Z', '2025-11-13T06:54:47.405Z');
INSERT OR IGNORE INTO documents (id, file_name, file_size, mime_type, storage_path, category, tags, description, uploaded_by, is_public, version, created_at, updated_at) VALUES ('e9ebe3fe-fedd-4d98-8c91-85d9dd25a409', '27031315d.pdf', '116068', 'application/pdf', '/objects/documents/08201cb3-f404-48c9-a3c0-f79beb9c3c08.pdf', 'Other', '[]', NULL, '39886143', 0, '1', '2025-11-13T08:08:09.790Z', '2025-11-13T08:08:09.790Z');
INSERT OR IGNORE INTO documents (id, file_name, file_size, mime_type, storage_path, category, tags, description, uploaded_by, is_public, version, created_at, updated_at) VALUES ('51208abf-c703-41f7-99f1-1dc9af3c60ef', 'Nov 2025 - Checking 5069.pdf', '130716', 'application/pdf', '/objects/documents/155a6ada-5032-4070-bce5-bbf55121cc4d.pdf', 'Financial', '["Financial","Bank Statement","Automated"]', 'Bank Statement for Checking 5069 - Nov 2025 (ID: 8c1f9e58-ce6f-11f0-8a85-1b2bac808c45)', 'dev-admin@marketstreethoa.com', 1, '1', '2025-12-30T21:19:11.518Z', '2025-12-30T21:19:11.518Z');
INSERT OR IGNORE INTO documents (id, file_name, file_size, mime_type, storage_path, category, tags, description, uploaded_by, is_public, version, created_at, updated_at) VALUES ('ff142684-68c8-4318-af27-72c80c12a9fe', 'Nov 2025 - Savings 0529.pdf', '130715', 'application/pdf', '/objects/documents/3bf6a50b-dcdb-4239-819f-2ae61bdd8f9d.pdf', 'Financial', '["Financial","Bank Statement","Automated"]', 'Bank Statement for Savings 0529 - Nov 2025 (ID: 68afc57e-ce6f-11f0-ab73-ab6d23f33420)', 'dev-admin@marketstreethoa.com', 1, '1', '2025-12-30T21:19:13.374Z', '2025-12-30T21:19:13.374Z');
INSERT OR IGNORE INTO documents (id, file_name, file_size, mime_type, storage_path, category, tags, description, uploaded_by, is_public, version, created_at, updated_at) VALUES ('dcbdc7a4-3b7a-4976-b6d2-9206bbd0d7d8', 'Nov 2025 - Checking 7900.pdf', '130717', 'application/pdf', '/objects/documents/736c7b55-88e8-4fa2-9cca-94d55092ea9b.pdf', 'Financial', '["Financial","Bank Statement","Automated"]', 'Bank Statement for Checking 7900 - Nov 2025 (ID: 5e65b2fe-ce6f-11f0-acdd-a71d4f56c491)', 'dev-admin@marketstreethoa.com', 1, '1', '2025-12-30T21:19:15.130Z', '2025-12-30T21:19:15.130Z');
INSERT OR IGNORE INTO architectural_requests (id, title, description, status, submitted_by, reviewed_by, review_notes, attachment_urls, created_at, updated_at, reviewed_at, request_type, household_id) VALUES ('0720af5d-9c57-4a3b-873a-11e02ba4ed32', 'fdsafafdf', 'asfadsfasfasfd', 'pending', 'local_1763501156174_uqbgbo', NULL, NULL, '[]', '2025-11-19T07:08:24.869Z', '2025-11-19T07:08:24.869Z', NULL, 'architectural', '7c55e37d-d43a-430f-97fc-209693c541a7');
INSERT OR IGNORE INTO architectural_requests (id, title, description, status, submitted_by, reviewed_by, review_notes, attachment_urls, created_at, updated_at, reviewed_at, request_type, household_id) VALUES ('f6a40842-4a08-4b19-99d8-bdd82d44de63', 'fasdfasdfads', 'grhsjjfgsfgsdg', 'approved', 'local_1763501156174_uqbgbo', 'local_1763501156174_uqbgbo', 'yes', '[]', '2025-11-19T07:08:43.467Z', '2025-11-27T07:17:10.656Z', '2025-11-27T07:17:10.656Z', 'general', '7c55e37d-d43a-430f-97fc-209693c541a7');
INSERT OR IGNORE INTO architectural_requests (id, title, description, status, submitted_by, reviewed_by, review_notes, attachment_urls, created_at, updated_at, reviewed_at, request_type, household_id) VALUES ('85a1dfef-7c54-4c91-9734-34db209f9f51', 'stjnwrf', 'ahrgacsaefe', 'denied', 'local_1763501156174_uqbgbo', 'local_1763501156174_uqbgbo', 'no way', '["/objects/documents/f0ac96d6-438f-44ae-bbf4-e814e0445001.png"]', '2025-11-19T07:11:54.238Z', '2025-11-27T07:17:39.796Z', '2025-11-27T07:17:39.796Z', 'contract_change', '7c55e37d-d43a-430f-97fc-209693c541a7');
INSERT OR IGNORE INTO dues_payments (id, user_id, payment_type, amount, period_start, period_end, status, due_date, paid_date, helcim_transaction_id, notes, created_at, updated_at, autopay_attempted_at, autopay_status, autopay_failure_reason, image_url) VALUES ('test-processing-1', 'local_1763501156174_uqbgbo', 'monthly', '200.00', '2026-01-01T05:00:00.000Z', '2026-01-31T05:00:00.000Z', 'payment_pending', '2026-01-15T05:00:00.000Z', NULL, 'TEST-HELCIM-TX-12345', 'Test processing payment', '2025-12-30T03:35:36.245Z', '2025-12-30T03:35:36.245Z', NULL, NULL, NULL, NULL);
INSERT OR IGNORE INTO dues_payments (id, user_id, payment_type, amount, period_start, period_end, status, due_date, paid_date, helcim_transaction_id, notes, created_at, updated_at, autopay_attempted_at, autopay_status, autopay_failure_reason, image_url) VALUES ('test-processing-2', 'local_1763501156174_uqbgbo', 'monthly', '200.00', '2026-02-01T05:00:00.000Z', '2026-02-28T05:00:00.000Z', 'payment_pending', '2026-02-15T05:00:00.000Z', NULL, 'TEST-HELCIM-TX-12345', 'Test processing payment', '2025-12-30T03:35:36.245Z', '2025-12-30T03:35:36.245Z', NULL, NULL, NULL, NULL);
INSERT OR IGNORE INTO dues_payments (id, user_id, payment_type, amount, period_start, period_end, status, due_date, paid_date, helcim_transaction_id, notes, created_at, updated_at, autopay_attempted_at, autopay_status, autopay_failure_reason, image_url) VALUES ('test-paid-1', 'local_1763501156174_uqbgbo', 'monthly', '200.00', '2025-10-01T04:00:00.000Z', '2025-10-31T04:00:00.000Z', 'paid', '2025-10-15T04:00:00.000Z', NULL, 'COMPLETED-TX-99999', 'Paid on time', '2025-12-30T03:35:36.245Z', '2025-10-10T04:00:00.000Z', NULL, NULL, NULL, NULL);
INSERT OR IGNORE INTO dues_payments (id, user_id, payment_type, amount, period_start, period_end, status, due_date, paid_date, helcim_transaction_id, notes, created_at, updated_at, autopay_attempted_at, autopay_status, autopay_failure_reason, image_url) VALUES ('test-due-1', 'local_1763501156174_uqbgbo', 'monthly', '200.00', '2026-03-01T05:00:00.000Z', '2026-03-31T04:00:00.000Z', 'pending', '2026-03-15T04:00:00.000Z', NULL, NULL, NULL, '2025-12-30T03:35:36.245Z', '2025-12-30T07:26:52.544Z', NULL, NULL, NULL, NULL);
INSERT OR IGNORE INTO dues_payments (id, user_id, payment_type, amount, period_start, period_end, status, due_date, paid_date, helcim_transaction_id, notes, created_at, updated_at, autopay_attempted_at, autopay_status, autopay_failure_reason, image_url) VALUES ('prepaid-credit-392073', 'local_1763501156174_uqbgbo', 'prepaid_credit', '100.00', '2026-03-01T05:00:00.000Z', '2026-03-31T04:00:00.000Z', 'payment_pending', '2025-12-29T05:00:00.000Z', NULL, '392073', 'ACH Prepaid Credit - Transaction: 392073 - $100.00 (applied toward March 2026 dues)', '2025-12-30T07:26:52.544Z', '2025-12-30T07:26:52.544Z', NULL, NULL, NULL, NULL);
INSERT OR IGNORE INTO dues_payments (id, user_id, payment_type, amount, period_start, period_end, status, due_date, paid_date, helcim_transaction_id, notes, created_at, updated_at, autopay_attempted_at, autopay_status, autopay_failure_reason, image_url) VALUES ('bea4e3b4-b781-49e9-b412-70db634b0c36', 'local_1763501156174_uqbgbo', 'monthly', '100.00', '2025-12-01T22:00:00.000Z', '2025-12-31T22:00:00.000Z', 'pending', '2025-12-17T22:00:00.000Z', NULL, NULL, 'yes dear', '2025-12-31T09:05:05.595Z', '2025-12-31T09:05:05.595Z', NULL, NULL, NULL, NULL);
INSERT OR IGNORE INTO dues_payments (id, user_id, payment_type, amount, period_start, period_end, status, due_date, paid_date, helcim_transaction_id, notes, created_at, updated_at, autopay_attempted_at, autopay_status, autopay_failure_reason, image_url) VALUES ('test-overdue-1', 'local_1763501156174_uqbgbo', 'monthly', '200.00', '2025-11-01T16:00:00.000Z', '2025-11-30T17:00:00.000Z', 'pending', '2025-11-14T17:00:00.000Z', NULL, '392066,392068', 'ACH Payments - Transactions: 392066, 392068 - $200.00 total. whaaaaaaaaaat', '2025-12-30T03:35:36.245Z', '2025-12-31T09:05:46.804Z', NULL, NULL, NULL, NULL);
INSERT OR IGNORE INTO payments (id, user_id, household_id, amount, payment_method, helcim_transaction_id, last4, card_type, bank_name, status, settled_at, failure_reason, applied_amount, unapplied_amount, source, notes, created_at, updated_at) VALUES ('0cd37e0d-bfd5-4911-9285-4ba90df9e621', 'local_1763501156174_uqbgbo', '7c55e37d-d43a-430f-97fc-209693c541a7', '100.00', 'ach', '392066', NULL, NULL, NULL, 'pending', NULL, NULL, '100.00', '0.00', 'online', 'ACH Payment for November 2025 dues', '2025-12-30T07:34:56.939Z', '2025-12-30T07:34:56.939Z');
INSERT OR IGNORE INTO payments (id, user_id, household_id, amount, payment_method, helcim_transaction_id, last4, card_type, bank_name, status, settled_at, failure_reason, applied_amount, unapplied_amount, source, notes, created_at, updated_at) VALUES ('d804eacd-1f80-4317-a053-27a65d16d862', 'local_1763501156174_uqbgbo', '7c55e37d-d43a-430f-97fc-209693c541a7', '100.00', 'ach', '392068', NULL, NULL, NULL, 'pending', NULL, NULL, '100.00', '0.00', 'online', 'ACH Payment for November 2025 dues', '2025-12-30T07:34:56.939Z', '2025-12-30T07:34:56.939Z');
INSERT OR IGNORE INTO payments (id, user_id, household_id, amount, payment_method, helcim_transaction_id, last4, card_type, bank_name, status, settled_at, failure_reason, applied_amount, unapplied_amount, source, notes, created_at, updated_at) VALUES ('305a2e76-2531-4b66-a859-6a76b8937ac9', 'local_1763501156174_uqbgbo', '7c55e37d-d43a-430f-97fc-209693c541a7', '100.00', 'ach', '392073', NULL, NULL, NULL, 'pending', NULL, NULL, '100.00', '0.00', 'online', 'ACH Prepaid Credit for March 2026 dues', '2025-12-30T07:34:56.939Z', '2025-12-30T07:34:56.939Z');
INSERT OR IGNORE INTO payment_applications (id, payment_id, dues_payment_id, amount, applied_at) VALUES ('e5eee60d-13d2-43ef-9f3a-9cda70a54b53', '0cd37e0d-bfd5-4911-9285-4ba90df9e621', 'test-overdue-1', '100.00', '2025-12-30T07:35:40.933Z');
INSERT OR IGNORE INTO payment_applications (id, payment_id, dues_payment_id, amount, applied_at) VALUES ('7e4a464f-9c8b-40f0-8833-4186a12f2b01', 'd804eacd-1f80-4317-a053-27a65d16d862', 'test-overdue-1', '100.00', '2025-12-30T07:35:40.933Z');
INSERT OR IGNORE INTO payment_applications (id, payment_id, dues_payment_id, amount, applied_at) VALUES ('0713f985-737e-4c37-8101-bc1a6a295946', '305a2e76-2531-4b66-a859-6a76b8937ac9', 'prepaid-credit-392073', '100.00', '2025-12-30T07:35:40.933Z');
INSERT OR IGNORE INTO bylaws (id, content, version, is_current, updated_by, notes, created_at, updated_at) VALUES ('982fc7e8-9df5-4767-b963-cb8692983d3d', '# DECLARATION OF COVENANTS, CONDITIONS, EASEMENTS AND RESTRICTIONS  
## FOR MARKET ST. HOMES  

---

**WHEN RECORDED RETURN TO:**  
Red Barn Construction, LLC  
1660 Rock Springs Lane  
Woodstock, GA 30189  

---

**THIS INSTRUMENT ESTABLISHES A MANDATORY MEMBERSHIP HOMEOWNERS ASSOCIATION AND SUBMITS THE COMMUNITY TO THE GEORGIA PROPERTY OWNERS’ ASSOCIATION ACT, O.C.G.A. §44-3-220, ET SEQ., ENACTED BY GA. LAWS 1994, p. 1879, §1.**

---

## TABLE OF CONTENTS  

| Part | Title | Page |
|------|-------|------|
| Parties | | 1 |
| **Article I** | Definitions and Rules of Construction | 2 |
| **Article II** | Common Area | 5 |
| **Article III** | Property Owners’ Association; Membership and Voting Rights | 7 |
| **Article IV** | Rights and Obligations of the Association | 9 |
| **Article V** | Maintenance | 10 |
| **Article VI** | Insurance and Casualty Losses | 11 |
| **Article VII** | Annexation of Property | 12 |
| **Article VIII** | Assessments | 13 |
| **Article IX** | Architectural Standards | 17 |
| **Article X** | Use Restrictions and Rules | 19 |
| **Article XI** | Easements | 21 |
| **Article XII** | Mortgagee Provisions | 23 |
| **Article XIII** | Declarant’s Rights | 23 |
| **Article XIV** | General Provisions | 24 |
| Signatures | | 27 |

---

## TABLE OF EXHIBITS  

- **Exhibit “A”**: Legal Description – A-1  
- **Exhibit “B”**: Bylaws of Market St. Homes Property Owners’ Association, Inc. – B-1  
- **Exhibit “C”**: Use Restrictions and Rules – C-1  

---

## DECLARATION  

**THIS DECLARATION** (the “Declaration”) is made as of the ___ day of February, 2022 (the “Effective Date”), by **RED BARN CONSTRUCTION, LLC**, a Georgia limited liability company (hereinafter referred to as the “Declarant”).

---

### STATEMENT OF FACTS  

1. Declarant is the owner of certain real property located in Cherokee County, Georgia, more particularly described on **Exhibit “A”** attached hereto and incorporated by reference.  
2. Declarant intends to construct, install, and develop on said property a residential subdivision known as **“MARKET ST. HOMES”** (hereinafter sometimes referred to as “Market St. Homes” or the “Development”).  
3. Declarant intends to impose mutually beneficial covenants, conditions, easements, and restrictions under a general plan of improvement for the benefit of all owners of residential property within the Development by recording this Declaration and any amendments thereto, thereby subjecting the property described in **Exhibit “A”** to the covenants, conditions, restrictions, easements, affirmative obligations, charges, and liens set forth herein.  
4. Accordingly, Declarant has incorporated **Market St. Homes Property Owners’ Association, Inc.**, a Georgia nonprofit corporation (the “Association”), to exercise and perform certain functions for the common good and general welfare of the Owners, as more fully provided herein.

---

### STATEMENT OF TERMS  

**NOW, THEREFORE**, the Declarant hereby declares that all real property described in **Exhibit “A”** shall be held, transferred, sold, conveyed, given, leased, occupied, and used subject to this Declaration of Covenants, Conditions, Easements and Restrictions, which is for the purpose of enhancing and protecting the value, desirability, and attractiveness of the Property.  

The covenants, conditions, easements, and restrictions set forth herein shall:  
- Run with the Property;  
- Be binding on all parties having or acquiring any right, title, or interest in the Property or any part thereof;  
- Subject to the limitations herein, inure to the benefit of each Owner and their respective heirs, personal representatives, successors, successors-in-title, and assigns, and to the benefit of the Association.  

Declarant further declares that the development, ownership, use, administration, maintenance, and preservation of the Property shall be subject to the **Georgia Property Owners'' Association Act** (O.C.G.A. § 44-3-220 et seq., enacted by Ga. Laws 1994, p. 1879, §1).

---

## ARTICLE I – DEFINITIONS AND RULES OF CONSTRUCTION  

This Declaration shall be interpreted fairly, in accordance with the plain meaning of its terms. Unless the context requires otherwise:  

- The singular includes the plural and vice versa;  
- “Include,” “includes,” and “including” are deemed followed by “without limitation”;  
- References such as “herein,” “hereby,” or “hereunder” refer to this Declaration as a whole, including all annexed Exhibits.  

Terms used herein and in the Association’s Articles of Incorporation and Bylaws shall have their commonly accepted meanings or those given in the **Georgia Nonprofit Corporation Code** (O.C.G.A. § 14-3-101 et seq., as amended). Certain defined terms appear upon first use and have the meanings ascribed unless context requires otherwise.

### KEY DEFINITIONS  

| Term | Definition |
|------|------------|
| **Articles of Incorporation** or **Articles** | Articles of Incorporation of Market St. Homes Property Owners’ Association, Inc. |
| **Association** | Market St. Homes Property Owners’ Association, Inc., a Georgia nonprofit corporation, its successors and assigns. |
| **Board of Directors** or **Board** | Governing body of the Association, selected per the Bylaws. |
| **Builder** | Person purchasing one or more Lots to construct improvements for later sale to consumers in the ordinary course of business. |
| **Bylaws** | Bylaws of the Association, attached as **Exhibit B**, as amended. |
| **Common Area** | All real and personal property submitted to the Declaration owned or leased by the Association for common use and enjoyment of Owners, including improvements, personal property, and easements granted for such use. Includes signs, walls, sprinklers, entrance areas, and landscaping in public rights-of-way. Certain portions may be for exclusive use of fewer than all Lots, with costs assessed to benefited Owners. Leased property loses Common Area status upon lease expiration. |
| **Common Expenses** | Actual and estimated expenses incurred or anticipated by the Association, including reasonable reserves, per this Declaration, Bylaws, and Articles. |
| **Community-Wide Standard** | Standard of conduct, maintenance, or activity generally prevailing throughout the Property, initially set by Declarant and later by the Board and Architectural Review Committee. |
| **Declarant** | Initially **Red Barn Construction, LLC**; any successor, successor-in-title, or assignee taking title for development and sale, designated as Declarant in a recorded instrument by the prior Declarant. Only one Person may exercise Declarant rights at a time. |
| **Design Guidelines** | Design and construction guidelines, application, and review procedures per **Article IX**. |
| **Development Survey** | Plat captioned “MARKET ST. HOMES,” dated August 7, 2020, last revised January 31, 2022, by Principled Engineering, certified by David A. Foster, Georgia Registered Professional Land Surveyor No. 25059, recorded in Plat Book ___, Page ___ , Cherokee County Clerk of Superior Court. |
| **General Assessment** | Assessments on all Lots to fund Common Expenses for general benefit of all Lots (Sections 8.1, 8.3). |
| **Georgia Property Owners’ Association Act** or **Act** | O.C.G.A. § 44-3-220 et seq., as amended. |
| **Governmental Authority** | Any court, arbitration mechanism, federal/state/local government, department, agency, board, commission, bureau, instrumentality, or regulatory authority. |
| **Law** | Any law, code, ordinance, order, ruling, decree, judgment, statute, regulation, standard, or enforceable judicial/administrative interpretation. |
| **Legal Requirement** | Obligation under any Law. |
| **Lot** | Parcel shown on Development Survey, improved or unimproved, independently owned and conveyed, intended for single-family residence. Includes numbered lots and structures thereon but excludes Common Area and public-dedicated property. |
| **Member** | Person entitled to membership per Section 3.2. |
| **Mortgage** | Mortgage, deed of trust, deed to secure debt, or other security instrument affecting title to a Lot. |
| **Mortgagee** | Holder or beneficiary of a Mortgage. |
| **Mortgagor** | Person granting a Mortgage. |
| **Occupant** | Person occupying any portion of a residence, whether tenant or Owner. |
| **Owner** | Record owner (including Declarant) of fee simple title to a Lot. If title is held as security for a loan, the person who would own in fee simple if the loan is paid in full is the Owner. |
| **Person** | Individual, trust, estate, custodian, nominee, partnership, LLC, corporation, association, or other entity, and their heirs, executors, administrators, legal representatives, successors, and assigns. |
| **Property** | Real property in **Exhibit “A”**, plus additional property subjected per **Article VII**. |
| **Public Records** | Official records in Office of Clerk of Superior Court of Cherokee County, Georgia, or designated location. |
| **Residence** | Detached dwelling on a Lot for single-family use/occupancy. Becomes a residence upon governmental inspections/approvals and conveyance to third party (unless builder uses as principal residence). Owner must notify Association upon completion of approvals. |
| **Restrictions** | All covenants, conditions, restrictions, easements, charges, liens, and obligations created by this Declaration and amendments. |
| **Structure** | Any improvement or object affecting Lot appearance, including dwellings, garages, sheds, porches, pools, fences, satellite dishes, landscaping, signs, etc.; or any excavation, grading, fill, etc., altering water flow. |
| **Special Assessment** | Assessment per Section 8.5. |
| **Specific Assessment** | Assessment per Section 8.6. |
| **Supplemental Declaration** | Instrument filed in Public Records subjecting additional property or imposing additional restrictions. |
| **Total Association Vote** | Votes attributable to entire membership (including Declarant) as of record date, excluding suspended votes. For example, 2/3 requires >2/3 of all existing member votes (excluding suspended). |

---

## ARTICLE II – COMMON AREA  

### 2.1 Conveyance of Common Area  
Declarant may transfer/convey real property (with improvements/personal property) or grant easements/leaseholds to the Association for Owners’ common use/enjoyment. Association agrees to accept such conveyances.  

**(a) Shared Facilities**  
Contemplated: entrance area (wall, signage, lighting, landscaping, irrigation), street signage (becomes Common Area upon installation). Declarant may modify prior to conveyance.  

**(b) Additional Property, Easements, or Rights**  
Declarant may convey additional real/personal property, easements, etc., for development completion (e.g., drainage, landscaping, irrigation).  

### 2.2 Right and Easement of Use and Enjoyment  
Every Owner has a right/easement to use/enjoy Common Area, appurtenant to and passing with Lot title. No interference with others’ use. Delegable to family, guests, tenants per Bylaws. Subject to suspension per Sections 2.3(e), 3.7.  

### 2.3 Rights of the Association  
Subject to Owner rights:  

- **(a)** Maintenance of Common Area.  
- **(b) Borrow Money** – For Association activities; encumber property (during Declarant control: requires Declarant approval + 67% Total Association Vote).  
- **(c) Grant Easements** – Over Common Area to governmental bodies, utilities, cable systems.  
- **(d) Maintain Landscaping** – In street rights-of-way if permitted by City of Woodstock/other authority.  
- **(e) Dedicate Common Area** – To Governmental Authority with 2/3 Member vote; ceases to be subject to Declaration while held by authority.  
- **(f) Suspend Privileges** – Per Section 3.7.  

### 2.4 No Partition  
No judicial partition of Common Area except as permitted. Board may acquire/dispose of personal property or real property (subject or not to Declaration).  

### 2.5 Condemnation  
Owner notice required. Award to Association as trustee:  

- **(a) Shared Improvements** – Restore/replace unless 75% Total Association Vote agrees otherwise within 60 days. Per Article VI(c) for funds.  
- **(b) Other Takings** – Disburse for Board-determined purposes.  

---

## ARTICLE III – PROPERTY OWNERS’ ASSOCIATION; MEMBERSHIP AND VOTING RIGHTS  

### 3.1 Purposes, Powers, and Duties  
Nonprofit corporation for management, maintenance, operation, control of Common Area. Enforces Declaration, rules, architectural standards. Performs functions per Declaration, Articles, Bylaws, Act, and Law.  

### 3.2 Membership  
Every Owner is a Member; terminates only upon ceasing to be Owner. One membership per Lot. Co-Owners share privileges, jointly/severally obligated. Non-natural person: officer, manager, partner, trustee, or designated individual exercises rights.  

### 3.3 Voting Rights  
One class. One equal vote per Lot. Co-Owners determine among themselves; absent agreement, vote suspended if >1 attempts exercise.  

### 3.4 Voting Procedures  
Per Declaration, Georgia Nonprofit Corporation Code, Articles, Bylaws, Act (in priority order).  

### 3.5 Board of Directors  
Manages Association affairs. Number, election/appointment per Bylaws.  

### 3.6 Suspension of Membership  
Board may suspend voting rights and Common Area enjoyment for:  

- **(a)** Failure to cure violation/breach within 30 days of notice.  
- **(b)** Delinquent assessment payment.  
- **(c)** Violation of Common Area rules (up to 60 days after cure).  

Suspension does not prevent Lot ingress/egress.  

### 3.8 Termination of Membership  
Ceases when person ceases to be Owner.  

---

## ARTICLE IV – RIGHTS AND OBLIGATIONS OF THE ASSOCIATION  

### 4.1 Common Area  
Manages/controls Common Area, keeps in good condition per Community-Wide Standard. May retain professional management (Common Expense).  

### 4.2 Personal/Real Property for Common Use  
May acquire/hold/dispose of property. Declarant/designees may convey property to Association (maintained at Association expense).  

### 4.3 Enforcement  
Imposes sanctions per Bylaws (fines per Act, suspend vote/use of facilities). Self-help to cure violations; suspend services to delinquent (>30 days) Lots.  

- **(a) Remedies Cumulative** – Includes costs, attorneys’ fees if Association prevails.  
- **(b) No Violation of Law** – No enforcement if inconsistent with Law or position weak.  

### 4.4 Implied Rights; Board Authority  
Exercises any express/implied right/privilege. Board acts without membership vote unless required.  

### 4.5 Dedication of Common Area  
To City of Woodstock or other Governmental Authority.  

### 4.6 Disclosure Regarding Security  
Association/Declarant not insurers/guarantors of security. No liability for inadequate security. Owners assume risks of injury/loss.  

---

## ARTICLE V – MAINTENANCE  

### 5.1 Association’s Responsibilities  
Maintains Common Area (entrance walls, signage, landscaping, lighting, utilities, street signage). Maintains Declarant-installed landscaping in rights-of-way if permitted. Consistent with Community-Wide Standard. May maintain non-owned property if beneficial (cost-sharing agreements).  

- **(a) Easements of Necessity** – Over Property for maintenance; assignable to utilities.  
- **(b) Allocation of Costs** – Common Expense unless benefits < all Lots (then Specific Assessment per Section 8.6).  

### 5.2 Owners’ Responsibilities  
Maintain Lot/structures/landscaping per Community-Wide Standard (unless Association-assumed). No tree/shrub/vegetation removal from Landscape Easement without Section 9.3 approval.  

- **(a) Remediation of Neglect** – Association may perform and assess costs if Owner fails.  
- **(b) Notice and Opportunity to Cure** – Reasonable notice except emergencies.  

### 5.3 Standard of Performance  
Consistent with Community-Wide Standard and covenants. Includes repair/replacement. Association not liable for damage/injury to non-owned property unless negligent.  

---

## ARTICLE VI – INSURANCE AND CASUALTY LOSSES  

### 6.1 Insurance  
Best efforts to insure Common Area improvements:  

- Fire, vandalism, malicious mischief, extended coverage (100% replacement cost less deductible).  
- Public liability (Board-determined).  
- Workers’ comp if required; fidelity bond if available.  
- 30-day cancellation notice. Premiums = Common Expense.  

### 6.2 Damage, Destruction, and Loss  
Board files/adjusts claims, obtains repair estimates.  

- **(a) Repair/Reconstruct** – Unless 75% Total Association Vote + Declarant (if applicable) agree otherwise within 60 days (extendable to 120 days). No Mortgagee vote.  
- **(b) Insufficient Proceeds** – Special Assessment without vote.  
- **(c) Alternative Restoration** – Restore to natural state, maintain neatly if no repair.  
- **(d) Excess Proceeds** – To capital improvements account. Deductible allocated to responsible parties.  

---

## ARTICLE VII – ANNEXATION OF PROPERTY  

### 7.1 Annexation by Member Approval  
With owner consent + 51% Total Association Vote.  

### 7.2 Method of Annexation  
File Supplemental Declaration in Public Records, signed by Association President/Secretary and property owner. Effective upon filing unless otherwise stated.  

### 7.3 Amendment  
Cannot amend this Article without Declarant consent while Declarant owns Exhibit “A” property.  

---

## ARTICLE VIII – ASSESSMENTS  

### 8.1 Creation and Obligation  
Association levies assessments for Common Expenses:  

- **(a) General** – All Lots.  
- **(b) Special** – Per Section 8.5.  
- **(c) Specific** – Per Section 8.6.  

Owner covenants to pay.  

- **(a) Personal Obligation and Lien** – With 10% interest (or less per Board), late charges (≤10%), costs, attorneys’ fees. Lien on Lot, superior except taxes and recorded Mortgages (if grantee/assignee not Seller). Joint/several liability on transfer; Mortgagee acquiring via foreclosure not liable for prior assessments (become Common Expense).  
- **(b) Proof of Payment** – Certificate upon request (processing fee allowed).  
- **(c) Due Dates; Payment** – Per Board; discounts/advance payment possible. General = annual, due Jan 1 (installments per Board). Delinquent: all installments due immediately.  
- **(d) No Diminution/Set-Off** – No exemption for non-use/abandonment. Association may enter subsidy/in-kind contracts with Declarant.  

### 8.2 Declarant’s Obligation  
Funds deficits until first budget/assessments. May recoup from operating account/initiation fees (not reserves). Reimbursed for nonpayment by others, deposits, budgeted expenses causing temporary deficits. Board may execute promissory note.  

### 8.3 Computation of General Assessments  
Budget ≥60 days before fiscal year, including reserves.  

- **(a) Levied Equally** – Rate to cover budgeted Common Expenses + reserves. Consider other funds/surplus/anticipated Lots.  
- **(b) Notice** – Copy + assessment amount ≥30 days prior. Effective unless 75% Total Association Vote disapproves.  
- **(c) Rejection** – Prior year budget continues until adopted.  

### 8.4 Reserve Budget and Capital Contributions  
Annual reserve budget for replaceable assets (life, cost). Capital contributions via General Assessments.  

### 8.5 Special Assessments  
For unbudgeted/excess expenses. Requires 75% Total Association Vote. Payable per Board (installments beyond year allowed). Against all if for Common Expenses.  

### 8.6 Specific Assessments  
Against individual Lot:  

- **(a) Special Services** – Requested benefits/services (menu per Board), advance deposit.  
- **(b) Enforcement Costs** – Bringing Lot into compliance (notice + hearing per Bylaws §3.21).  

### 8.7 Lien for Assessments  
Superior except taxes, recorded Mortgages (if not Seller).  

- **(a) Enforcement** – Sue/foreclose per Act/other Law.  
- **(b) Foreclosure** – Association may bid/acquire/hold/lease/mortgage/convey. While owned: no vote/assessment; other Lots share pro rata. May sue without foreclosing.  
- **(c) Conveyance Subject to Lien** – Sale/transfer doesn’t affect lien for subsequent assessments. Foreclosure of superior Mortgage extinguishes prior lien; unpaid = Common Expense.  

### 8.8 Commencement of Assessments  
When Board first budgets/levies. Per Lot: first day of month after later of budget/levy or Lot subjected. Prorated first year.  

### 8.9 Failure to Assess  
No waiver; continue prior basis until new, retroactive if needed.  

### 8.10 Exempt Property  
Common Area, public-dedicated property, public utilities.  

### 8.11 Initiation Fees  
$____ from purchaser (not Declarant/approved Builder) at closing to Association. For Association use. Interest + Specific Assessment if unpaid. Proof of sale price required if requested.  

---

## ARTICLE IX – ARCHITECTURAL STANDARDS  

### 9.1 General  
No structure/improvement (staking, clearing, excavation, grading, alteration, planting/removal) except per this Article + Board (as ARC) approval.  

- **(a) Exemptions** – Interior remodeling/painting/decoration; repainting per original scheme; rebuilding per original plans.  
- **(b) Exemptions** – Declarant activities; Association improvements to Common Area.  
- Cannot amend without Declarant consent while Declarant owns subject/annexable land.  

### 9.2 Architectural Review  
Board acts as **Architectural Review Committee (ARC)** (excludes director appointed by applicant Owner). May charge fees, employ professionals. May delegate to licensed architects/qualified persons.  

### 9.3 Guidelines and Procedures  

- **(a) Design Guidelines** – Declarant prepares (general + specific). ARC adopts/amends (prospective only). Available to Owners/Builders.  

- **(b) Procedures** – Submit plans/specs (site plan, foundation, floor, elevations, materials, colors, irrigation, drainage, lighting, landscaping, grading). ARC considers quality, harmony, location, aesthetics. Decisions subjective.  

- **(c) Approval/Disapproval** – Deemed approved if no written response in 30 days. Inconsistent with Guidelines only with variance. Work complete in 1 year or per approval (extensions for uncontrollable delays).  

### 9.4 No Waiver of Future Approvals  
Prior approval ≠ waiver for similar future matters.  

### 9.5 Limitation of Liability  
Aesthetic review only; no responsibility for structural integrity, codes, requirements.  

### 9.6 Enforcement  
Nonconforming work: Owner removes/restores at own cost. Association may enter/remove/restore + assess as Specific Assessment.  

---

## ARTICLE X – USE RESTRICTIONS AND RULES  

### 10.1 Plan of Development  
Enhances collective interests, aesthetics, environment. Regulates Common Area. Subject to Article IX, conduct provisions, promulgated guidelines/rules.  

### 10.2 Application and Effect; Leases  
Applies to Owners, occupants, tenants, guests, invitees. Leases must bind lessee to Community Agreements.  

### 10.3 Authority to Promulgate  

- **Initial Rules** – Attached as **Exhibit “C”**.  

- **Modification** –  

  - **(a) By Board** – Notice ≥5 business days; Members heard; effective unless 51% Total Association Vote rejects at meeting (petition for special meeting per Bylaws).  
  - **(b) By Members** – 51% Total Association Vote at meeting per Bylaws.  
  - **(c) Notice** – ≥30 days prior copy to Owners; copy on request.  
  - **(d) Design Guidelines Control** – Prevail if inconsistent.  

### 10.4 Owners’ Acknowledgement  
Use limited by Rules (may change). Affects enjoyment/marketability.  

### 10.5 Rights of Owners (Rules Only)  

- **(a) Equal Treatment** – Similar Owners/occupants.  
- **(b) Religious/Holiday Displays** – Reasonable time/place/manner.  
- **(c) Household Composition** – Freedom except single housekeeping unit.  
- **(d) Activities Within Dwellings** – No interference except non-residential, costly, dangerous, noisy, unsightly, annoying.  
- **(e) Allocation** – No detriment over objection (except Common Area changes, abuse suspension, assessment increases).  
- **(f) Alienation** – No prohibition/consent for leasing/transfer.  
- **(g) Declarant Development** – No unreasonable impediment.  
- **(h) Vested Rights** – Pre-Rule compliant rights preserved without consent.  

---

## ARTICLE XI – EASEMENTS  

### 11.1 Utilities, Maintenance, Replacement, Repair  
Reserved to Declarant (while owning Exhibit “A” property), Association, designees: perpetual non-exclusive easements over Property (not through structures) for utilities, cable, security, drainage, irrigation, street lights, signage.  

- **(a) Development Easements** – Specific easements for orderly development.  
- **(b) Restrictions** – Repair damage at exerciser’s expense; no unreasonable interference; reasonable notice except emergencies.  

### 11.2 Drainage Easements  
For bulkheads, retaining walls, trash removal. Reasonable care/repair; no liability for flooding. Not obligated to act.  

### 11.3 Right of Entry  
For emergency, security, safety, maintenance (Article V), compliance inspection. By Board, officers, agents, ARC, emergency personnel. Reasonable hours + notice except emergencies. Includes self-help for fire hazards (no dwelling entry without permission except emergencies).  

### 11.4 Landscape Easements and Tree Preservation  
Reserved to Declarant (while owning Exhibit “A”), Association, designees: access, installation, pruning, maintenance, removal, replacement of street trees/landscaping in road-adjacent areas and recorded Landscape Easements. Restore neatly. No Owner disturbance without Section 9.3 approval.  

---

## ARTICLE XII – MORTGAGEE PROVISIONS  

For Superior Mortgage holders/insurers/guarantors. Applies to Declaration and Bylaws.  

### 12.1 Notice of Action  
Written request → timely notice of 60-day delinquency or uncured violation.  

### 12.2 No Priority  
No Owner priority over Superior Mortgage in insurance/condemnation distributions for Common Area.  

### 12.3 Notice to Association  
Owner furnishes Superior Mortgagee name/address upon request.  

### 12.4 Applicability  
Doesn’t reduce required votes.  

### 12.5 Failure to Respond  
Deemed approval if no response in 30 days to certified request.  

---

## ARTICLE XIII – DECLARANT’S RIGHTS  

Transferable/assignable in recorded instrument.  

- **(a) Access/Use** – Maintain facilities/activities on Common Area for construction/sale; easements for access/use/improvements.  
- **(b) No Restriction** – No unauthorized instruments affecting Property without Declarant consent (void unless approved).  

Cannot amend without Declarant consent while owning subject land.  

---

## ARTICLE XIV – GENERAL PROVISIONS  

### 14.1 Duration  
20 years + automatic 20-year renewals unless terminated per Georgia law. If perpetuity violation, continues until later of 360 years from Effective Date or 21 years after last survivor of Queen Elizabeth II’s living descendants.  

### 14.2 Amendment  

- **(a) By Declarant** – Unilaterally for compliance, title insurance, lender/insurer/guarantor enablement, agency requirements (no adverse title effect). Other purposes while owning Exhibit “A” property if no material adverse Owner right.  
- **(b) By Members** – 67% Total Association Vote (+ Declarant if option/control exists). No remove/modify Declarant right without consent; no greater restriction on Declarant-owned lots; no prohibit/ restrict ≥6-month leases for non-owner occupied lots (post-conveyance for value ≥$100 conforms).  
- **(c) By Board** – Conform to mandatory Act provisions.  
- **(d) Unanimous Consent** – Boundary/vote/liability changes per Act/all Owners/Mortgagees.  
- **(e) Validity/Effective Date** – Executed by required majority or President/Secretary sworn statement (all notices given). Recorded or later date specified.  
- **(f) Mortgagee Assent** – Deemed if no response in 30 days to certified mail.  
- **(g) Owner Assent** – Conclusive; no contrary Mortgage/contract affects.  
- **(h) Contests** – Presumed valid if suit >1 year after recording; challenger bears burden.  

### 14.3 Severability  
Invalid provision/application doesn’t affect others.  

### 14.4 Litigation  
Requires 75% Member vote except enforcement, assessments, tax challenges, counterclaims, contractor/supplier suits. Cannot amend without same vote/procedure.  

### 14.5 Compliance  
Owners/occupants comply; grounds for Association/aggrieved Owner action (damages, injunctive relief, law/equity remedies + Section 4.3 powers).  

### 14.6 Notice of Sale/Transfer  
≥7 days prior written notice to Board (purchaser/transferee details). Transferor liable until notice.  

---

## SIGNATURES  

**DECLARANT:**  
RED BARN CONSTRUCTION, LLC  

By: ___________________________ (SEAL)  
Name: ____________________  
Title: _________________________  

Signed, sealed, delivered in presence of:  
______________________________ (Unofficial Witness)  
______________________________ (Notary Public)  
[NOTARIAL SEAL]  
My Commission Expires: _________  

---

**ASSOCIATION ACKNOWLEDGMENT:**  
MARKET ST. HOMES PROPERTY OWNERS’ ASSOCIATION, INC.  

By: ___________________________ (President)  
Attest: _________________________ (Secretary)  

Signed, sealed, delivered in presence of:  
__________________________________ (Unofficial Witness)  
______________________________________ (Notary Public)  
[NOTARIAL SEAL]  
My Commission Expires: _________________  

---

## EXHIBIT “A” – LEGAL DESCRIPTION  
*(Page A-1)*  

---

## EXHIBIT “B” – BYLAWS OF MARKET ST. HOMES PROPERTY OWNERS’ ASSOCIATION, INC.  
*(Pages B-1 through B-10 – Summarized below for clarity)*  

### ARTICLE 1 – NAME, MEMBERSHIP, DEFINITIONS  
- Name: Market St. Homes Property Owners’ Association, Inc.  
- Membership: Per Declaration.  
- Definitions: Per Declaration or Georgia Nonprofit Corporation Code.  

### ARTICLE 2 – MEETINGS, QUORUM, VOTING, PROXIES  
- **2.1 Place**: Principal office or convenient location.  
- **2.2 Annual**: Receive reports, install directors, transact business.  
- **2.3 Special**: Called by President/Board or ≥25% Total Association Vote petition.  
- **2.4 Record Date**: ≤70 days prior.  
- **2.5 Notice**: ≥21 days (or 30 if not first-class) to record address; states time/place/purpose.  
- **2.6 Waiver**: Writing or attendance without objection.  
- **2.7 Adjournment**: Majority of present may adjourn 5–30 days.  
- **2.8 Membership List**: Alphabetical, available ≥2 business days after notice.  
- **2.9 Voting**: Per Declaration/Articles.  
- **2.10 Proxies**: Written/electronic, filed prior, revocable, expires 11 months.  
- **2.11 Quorum**: ≥25% Total Association Vote; continues despite withdrawals.  
- **2.12 Written Consent**: ≥Majority (unless higher required); dated ≤70 days; notice to non-consenters ≥10 days prior effective.  
- **2.13 Written Ballot**: Sets forth action, quorum/approval requirements, deadline; revocable until quorum met.  

### ARTICLE 3 – BOARD OF DIRECTORS  
- **3.1 Composition**: Natural persons ≥18; Owners (or representatives); no same-Lot co-service with spouse/co-Owner/occupant.  
- **3.2 Declarant Appointment**: Until all Lots conveyed or Declarant surrenders.  
- **3.3 Number**: 1–3 during Declarant control; 4 thereafter (1 per Lots 1–4).  
- **3.4 Nomination**: Floor or committee.  
- **3.5 Election/Term**: Post-Declarant: special meeting/action; 1 director per Lot 1–4; continue until successors.  
- **3.6 Removal**: By designating member(s) with notice/successor; or majority remaining directors for 3 absences or >30-day delinquency.  
- **3.7 Vacancies**: Filled by unrepresented Lot’s Owner(s).  
- **3.8–3.10 Meetings**: Organization ≤10 days post-election; regular (schedule notice); special (≥2 days notice).  
- **3.11 Waiver**: Writing/attendance.  
- **3.12 Quorum**: Majority; majority vote decides.  
- **3.13 Compensation**: None.  
- **3.14–3.15 Open/Executive**: Open except personnel/litigation/similar; announce in open.  
- **3.16 Written Consent**: Majority.  
- **3.17 Telephonic**: Allowed if all hear each other.  
- **3.18 Powers**: All necessary for administration (budget, assessments, maintenance, rules, insurance, contracts, enforcement/fines, etc.).  
- **3.19 Management**: ≤1-year contract, 90-day termination.  
- **3.20 Borrowing**: Membership approval if >10% budget.  
- **3.21 Fining**: Notice (10 days or 24 hrs for signs), hearing opportunity; repeat within 12 months without hearing; self-help/towing/suits allowed.  

### ARTICLE 4 – OFFICERS  
- President, VP, Secretary, Treasurer (President/Treasurer from Board; no Declarant restriction).  
- Appointed annually post-Declarant; vacancies filled by Board.  
- Additional officers/agents per Board.  
- No compensation; removable by Board (except Declarant-appointed).  
- Duties: President (CEO), VP (acts in absence), Secretary (minutes, seal), Treasurer (finances).  

### ARTICLE 5 – COMMITTEES  
Advisory/standing/ad hoc per Board/Declaration; no Board authority unless express.  

### ARTICLE 6 – MISCELLANEOUS  
- Fiscal year: Calendar unless Board changes.  
- Roberts Rules governs unless conflict.  
- Priority: Law > Declaration > Articles > Bylaws.  
- Electronic means allowed with security.  
- Amendment: Board with Declarant consent for compliance/enablement; otherwise 2/3 Total Association Vote + Declarant.  

### ARTICLE 7 – INDEMNIFICATION  
Fullest permitted by Georgia Nonprofit Corporation Code; advancement; Association may require defense participation; may purchase insurance.  

---

## EXHIBIT “C” – USE RESTRICTIONS AND RULES  

### 1. General  
Residential/recreational only; no public commercial use.  

### 2. Restricted Activities (Unless Board-Approved)  
- **(a) Parking**: No street parking, commercial/trailers/boats/RVs outside garages (daylight service/delivery exempt).  
- **(b) Animals**: Reasonable household pets; leashed/confined; no nuisance (removable).  
- **(c) Emissions**: No foul odors/noise disturbing peace/safety.  
- **(d) Waste**: No dumping grass/chemicals (fertilizers minimized); Declarant/Builders may bury debris.  
- **(e) Trash**: Only in approved containers between pickups.  
- **(f) Drainage**: No obstruction/rechanneling.  
- **(g) Subdivision**: Prohibited post-plat.  
- **(h) Business**: Allowed inside if undetectable, zoned, no visitation/solicitation, residential character.  
- **(i) Remodeling**: No carport/garage conversion without ARC.  
- **(j) Structures**: All require Article IX approval (mailboxes, hoops, pools, antennas, fences, etc.). No signs without Board consent (Declarant/Board exempt).  
- **(l) Trees**: No removal ≥4" diameter @ 3'' except diseased/dead/safety.  
- **(m) Displays**: No offensive/excessive religious/holiday.  
- **(n) Habitat**: No material disturbance to vegetation/wildlife/wetlands/drainage/air.  

### 3. Leasing  
Not business/trade. Written lease ≥6 months; notice to Board ≤10 days post-execution; provide Community Agreements.  

### 4. Common Area Use  
No obstruction/storage without Board consent. Reservable with approval; user assumes risks/liability. No Owner gardening/landscaping without consent. Declarant exempt.  

### 5. Declarant Exemption  
All restrictions inapplicable to Declarant/approved Builder development/sales activities.  

--- 

*(End of formatted document. All original content preserved; structure, headings, tables, and bullet points added for readability.)*', '1.0', 1, 'dev-admin@marketstreethoa.com', '', '2025-11-12T18:52:36.239Z', '2025-11-12T18:52:36.239Z');
INSERT OR IGNORE INTO account_categories (id, name, type, parent_id, code, description, is_active, created_at) VALUES ('9a5b8a93-9cb8-43a2-b00a-2cfa97c5869f', 'Cash - Operating Account', 'asset', NULL, '1000', NULL, 1, '2025-11-19T06:42:35.702Z');
INSERT OR IGNORE INTO account_categories (id, name, type, parent_id, code, description, is_active, created_at) VALUES ('63f9e48d-f2d8-4f2a-b91d-fefe71a61e9d', 'Cash - Reserve Account', 'asset', NULL, '1100', NULL, 1, '2025-11-19T06:42:35.702Z');
INSERT OR IGNORE INTO account_categories (id, name, type, parent_id, code, description, is_active, created_at) VALUES ('60fa6e8c-6690-4b53-893d-2aa165e60021', 'Accounts Receivable - Dues', 'asset', NULL, '1200', NULL, 1, '2025-11-19T06:42:35.702Z');
INSERT OR IGNORE INTO account_categories (id, name, type, parent_id, code, description, is_active, created_at) VALUES ('3a8946a0-6e92-4236-8726-1edced9f196e', 'Prepaid Insurance', 'asset', NULL, '1300', NULL, 1, '2025-11-19T06:42:35.702Z');
INSERT OR IGNORE INTO account_categories (id, name, type, parent_id, code, description, is_active, created_at) VALUES ('853db3d1-c6fb-4a0b-94f8-f9c46112f469', 'Equipment', 'asset', NULL, '1400', NULL, 1, '2025-11-19T06:42:35.702Z');
INSERT OR IGNORE INTO account_categories (id, name, type, parent_id, code, description, is_active, created_at) VALUES ('9b3947aa-43f3-4b32-a550-868048e3df94', 'Accounts Payable', 'liability', NULL, '2000', NULL, 1, '2025-11-19T06:42:35.702Z');
INSERT OR IGNORE INTO account_categories (id, name, type, parent_id, code, description, is_active, created_at) VALUES ('c2d8cb0c-58e2-498c-8049-c4803bc58ed7', 'Deferred Revenue', 'liability', NULL, '2100', NULL, 1, '2025-11-19T06:42:35.702Z');
INSERT OR IGNORE INTO account_categories (id, name, type, parent_id, code, description, is_active, created_at) VALUES ('1cf8f416-a726-45b3-ad9d-f0c936217859', 'Loans Payable', 'liability', NULL, '2200', NULL, 1, '2025-11-19T06:42:35.702Z');
INSERT OR IGNORE INTO account_categories (id, name, type, parent_id, code, description, is_active, created_at) VALUES ('0de8cfb4-0f6a-4bb4-820a-044ea3593d23', 'Retained Earnings', 'equity', NULL, '3000', NULL, 1, '2025-11-19T06:42:35.702Z');
INSERT OR IGNORE INTO account_categories (id, name, type, parent_id, code, description, is_active, created_at) VALUES ('d1c1612c-4672-4564-a38c-9bf5719aabd0', 'Current Year Surplus/Deficit', 'equity', NULL, '3100', NULL, 1, '2025-11-19T06:42:35.702Z');
INSERT OR IGNORE INTO account_categories (id, name, type, parent_id, code, description, is_active, created_at) VALUES ('44b31967-f120-4f88-a543-86c1cacade56', 'Monthly Dues', 'revenue', NULL, '4000', NULL, 1, '2025-11-19T06:42:35.702Z');
INSERT OR IGNORE INTO account_categories (id, name, type, parent_id, code, description, is_active, created_at) VALUES ('404c6f82-2d75-42e6-a41b-7370f0c6bcac', 'Special Assessments', 'revenue', NULL, '4100', NULL, 1, '2025-11-19T06:42:35.702Z');
INSERT OR IGNORE INTO account_categories (id, name, type, parent_id, code, description, is_active, created_at) VALUES ('4a15d456-f123-48c1-981c-25a97a9785ab', 'Late Fees', 'revenue', NULL, '4200', NULL, 1, '2025-11-19T06:42:35.702Z');
INSERT OR IGNORE INTO account_categories (id, name, type, parent_id, code, description, is_active, created_at) VALUES ('ef5b0a8d-7e19-4cb2-8c8e-f689158be258', 'Interest Income', 'revenue', NULL, '4300', NULL, 1, '2025-11-19T06:42:35.702Z');
INSERT OR IGNORE INTO account_categories (id, name, type, parent_id, code, description, is_active, created_at) VALUES ('21a55c77-2d58-4582-aa90-769be807839b', 'Other Income', 'revenue', NULL, '4400', NULL, 1, '2025-11-19T06:42:35.702Z');
INSERT OR IGNORE INTO account_categories (id, name, type, parent_id, code, description, is_active, created_at) VALUES ('6d87dbf9-da72-4a97-b652-b8b28b311fb0', 'Landscaping', 'expense', NULL, '5000', NULL, 1, '2025-11-19T06:42:35.702Z');
INSERT OR IGNORE INTO account_categories (id, name, type, parent_id, code, description, is_active, created_at) VALUES ('161eeb1f-58b9-4b7d-b2cb-15132dc1e0e2', 'Building Maintenance', 'expense', NULL, '5200', NULL, 1, '2025-11-19T06:42:35.702Z');
INSERT OR IGNORE INTO account_categories (id, name, type, parent_id, code, description, is_active, created_at) VALUES ('9fee3abc-b9c9-46aa-b6ba-6ebb04380b68', 'Common Area Utilities', 'expense', NULL, '5300', NULL, 1, '2025-11-19T06:42:35.702Z');
INSERT OR IGNORE INTO account_categories (id, name, type, parent_id, code, description, is_active, created_at) VALUES ('a83f531e-d11a-485c-8c97-e6c52a7e2f5b', 'Pest Control', 'expense', NULL, '5400', NULL, 1, '2025-11-19T06:42:35.702Z');
INSERT OR IGNORE INTO account_categories (id, name, type, parent_id, code, description, is_active, created_at) VALUES ('bbc8282c-6093-4133-b585-a724e193cbd5', 'Insurance - Property', 'expense', NULL, '6000', NULL, 1, '2025-11-19T06:42:35.702Z');
INSERT OR IGNORE INTO account_categories (id, name, type, parent_id, code, description, is_active, created_at) VALUES ('06e765ce-e6f5-47e2-8aaf-10b7545911f3', 'Insurance - Liability', 'expense', NULL, '6100', NULL, 1, '2025-11-19T06:42:35.702Z');
INSERT OR IGNORE INTO account_categories (id, name, type, parent_id, code, description, is_active, created_at) VALUES ('59db633a-5b16-465b-97e3-169a81f1564b', 'Management Fees', 'expense', NULL, '7000', NULL, 1, '2025-11-19T06:42:35.702Z');
INSERT OR IGNORE INTO account_categories (id, name, type, parent_id, code, description, is_active, created_at) VALUES ('7c0c80e4-39ee-4358-8989-3b38f291693b', 'Legal Fees', 'expense', NULL, '7100', NULL, 1, '2025-11-19T06:42:35.702Z');
INSERT OR IGNORE INTO account_categories (id, name, type, parent_id, code, description, is_active, created_at) VALUES ('8abbfbbb-1068-4c61-a8b0-7722f6f5e3cf', 'Accounting Fees', 'expense', NULL, '7200', NULL, 1, '2025-11-19T06:42:35.702Z');
INSERT OR IGNORE INTO account_categories (id, name, type, parent_id, code, description, is_active, created_at) VALUES ('8351c93d-69a5-440b-91a6-743622c3d700', 'Reserve Fund Contribution', 'expense', NULL, '8000', NULL, 1, '2025-11-19T06:42:35.702Z');
INSERT OR IGNORE INTO account_categories (id, name, type, parent_id, code, description, is_active, created_at) VALUES ('8ba94c89-dd82-4bff-90c0-2b299de4c99d', 'Office Supplies', 'expense', NULL, '9000', NULL, 1, '2025-11-19T06:42:35.702Z');
INSERT OR IGNORE INTO account_categories (id, name, type, parent_id, code, description, is_active, created_at) VALUES ('414252cb-ef76-4262-9423-afc422045fdc', 'Bank Fees', 'expense', NULL, '9100', NULL, 1, '2025-11-19T06:42:35.702Z');
INSERT OR IGNORE INTO account_categories (id, name, type, parent_id, code, description, is_active, created_at) VALUES ('a111c25d-9eca-4379-ac03-518ac2df4182', 'Pool Maintenance- no pool', 'expense', NULL, '5100', '', 1, '2025-11-19T06:42:35.702Z');
INSERT OR IGNORE INTO account_categories (id, name, type, parent_id, code, description, is_active, created_at) VALUES ('9896ca5d-eb46-476b-9bfc-8195bab94d3d', 'dddad', 'asset', NULL, '1004', '', 1, '2025-12-31T21:55:17.158Z');
INSERT OR IGNORE INTO budgets (id, category_id, year, month, budgeted_amount, notes, created_at, updated_at) VALUES ('15e687b9-fc5f-4ef7-91eb-ab22ba22b8ed', '44b31967-f120-4f88-a543-86c1cacade56', 2026, NULL, '6000.00', NULL, '2026-01-02T07:42:17.347Z', '2026-01-02T07:42:17.347Z');
INSERT OR IGNORE INTO budgets (id, category_id, year, month, budgeted_amount, notes, created_at, updated_at) VALUES ('45f92b64-f30f-408f-a09a-802ead4077e6', '6d87dbf9-da72-4a97-b652-b8b28b311fb0', 2026, NULL, '2396.00', NULL, '2026-01-02T07:42:17.347Z', '2026-01-02T07:42:17.347Z');
INSERT OR IGNORE INTO transaction_codings (id, mercury_transaction_id, category_id, notes, coded_by, coded_at, updated_at, status) VALUES ('94f23e54-aa20-46ce-9ce5-6750a12beaea', '97fe5ea6-cb01-11f0-ad99-cb1936f0d2ee', '44b31967-f120-4f88-a543-86c1cacade56', NULL, 'local_1763501156174_uqbgbo', '2025-12-31T22:18:14.463Z', '2025-12-31T22:18:14.463Z', 'coded');
INSERT OR IGNORE INTO transaction_codings (id, mercury_transaction_id, category_id, notes, coded_by, coded_at, updated_at, status) VALUES ('48a639ed-6534-432e-a19c-2177a27951b7', '6c269502-e666-11f0-93d7-774303152823', '44b31967-f120-4f88-a543-86c1cacade56', NULL, 'local_1763501156174_uqbgbo', '2025-12-31T22:18:22.323Z', '2025-12-31T22:18:22.323Z', 'coded');
INSERT OR IGNORE INTO system_settings (id, key, value, updated_at) VALUES ('192986a5-4ad5-40a8-9a22-405f1f76d58a', 'monthly_dues_amount', '132', '2025-12-30T21:52:55.580Z');