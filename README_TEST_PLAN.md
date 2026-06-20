# CivicAI — Role-Based Access Control (RBAC) Manual Test Plan

This document outlines the test cases and steps to manually verify the route protection and role-based access control (RBAC) rules specified in [05_SECURITY.md](file:///home/singason/Desktop/Team%20Project/civicai/docs/05_SECURITY.md).

## RBAC Permissions Reference

| Action                         |   Guest (unauthenticated)    |       Citizen (authenticated)       |   Admin    |
| :----------------------------- | :--------------------------: | :---------------------------------: | :--------: |
| **1. View published policies** |          ✅ Allowed          |             ✅ Allowed              | ✅ Allowed |
| **2. Listen to audio**         |          ✅ Allowed          |             ✅ Allowed              | ✅ Allowed |
| **3. Submit feedback**         |          ❌ Blocked          |             ✅ Allowed              | ✅ Allowed |
| **4. Upload policy**           | ❌ Blocked (Redirect /login) | ❌ Blocked (Redirect /unauthorized) | ✅ Allowed |
| **5. View all feedback**       | ❌ Blocked (Redirect /login) | ❌ Blocked (Redirect /unauthorized) | ✅ Allowed |
| **6. Delete policy**           | ❌ Blocked (Redirect /login) | ❌ Blocked (Redirect /unauthorized) | ✅ Allowed |
| **7. Manage users**            | ❌ Blocked (Redirect /login) | ❌ Blocked (Redirect /unauthorized) | ✅ Allowed |

---

## Prerequisites for Manual Testing

To run these test cases, prepare two separate test accounts:

1. **Citizen Account:** A standard registered user account (e.g., `citizen@civicai.ke`).
2. **Admin Account:** A user account with the `admin` role set in the database (e.g., `admin@civicai.ke`).
   - Run the following SQL in your Supabase SQL editor to assign the admin role to a user:
     ```sql
     UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@civicai.ke';
     ```

---

## Test Cases

### Scenario 1: Guest (Unauthenticated Citizen)

1. **Test: View published policies**
   - **Steps:** Navigate to `/` or `/policies` in an Incognito window.
   - **Expected Outcome:** The page loads and displays the list of policies.
2. **Test: Listen to audio**
   - **Steps:** Navigate to a policy page at `/policies/[id]` and look at the audio player section.
   - **Expected Outcome:** The audio player interface is accessible and functional.
3. **Test: Submit feedback**
   - **Steps:** Navigate to `/policies/[id]`. Try to find the feedback form.
   - **Expected Outcome:** The feedback form is hidden, showing a prompt like "Login to submit your feedback" instead.
   - **Alternative API test:** Send a `POST` request to `/api/policies/[id]/feedback` without any session headers. It should return `401 Unauthorized`.
4. **Test: Access Admin Pages**
   - **Steps:** Attempt to navigate directly to `/admin`, `/admin/upload`, `/admin/feedback`.
   - **Expected Outcome:** The middleware redirects you immediately to `/login`.
5. **Test: Access Profile Page**
   - **Steps:** Attempt to navigate directly to `/profile`.
   - **Expected Outcome:** The middleware redirects you immediately to `/login`.

---

### Scenario 2: Citizen (Authenticated User)

1. **Test: View published policies**
   - **Steps:** Log in as `citizen@civicai.ke` and navigate to `/policies`.
   - **Expected Outcome:** The policy list page is visible.
2. **Test: Listen to audio**
   - **Steps:** Navigate to `/policies/[id]`.
   - **Expected Outcome:** The audio player is visible and functional.
3. **Test: Submit feedback**
   - **Steps:** Navigate to `/policies/[id]`. Locate the feedback form.
   - **Expected Outcome:** The feedback form is visible, allowing you to submit rating/comments.
4. **Test: Access Admin Pages**
   - **Steps:** Attempt to navigate directly to `/admin`, `/admin/upload`, `/admin/feedback`.
   - **Expected Outcome:** The middleware intercepts the request, checks your profile role (which is `user`), and redirects you to `/unauthorized`.
5. **Test: Access Profile Page**
   - **Steps:** Navigate to `/profile`.
   - **Expected Outcome:** The page loads and is accessible.

---

### Scenario 3: Admin (Authenticated Admin)

1. **Test: Access Admin Pages**
   - **Steps:** Log in as `admin@civicai.ke` and navigate to `/admin`, `/admin/upload`, `/admin/feedback`.
   - **Expected Outcome:** The pages load successfully without any redirection.
2. **Test: View published policies & Listen to audio**
   - **Steps:** Navigate to `/policies` and `/policies/[id]`.
   - **Expected Outcome:** Pages load and function normally.
3. **Test: Submit feedback**
   - **Steps:** Navigate to `/policies/[id]`.
   - **Expected Outcome:** The feedback form is visible and submissions are permitted.
4. **Test: Access Profile Page**
   - **Steps:** Navigate to `/profile`.
   - **Expected Outcome:** The page loads successfully.
