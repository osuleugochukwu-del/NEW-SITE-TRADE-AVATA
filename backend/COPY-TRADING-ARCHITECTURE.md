# Trade Avata Copy Trading Architecture

Copy Trading is a first-class platform module, not a generic tool.

## Visibility states
- private: not in public navigation/discovery
- testing: authorized tester accounts can use the module
- ready: internal release candidate state
- live: public member access can be enabled

Visibility, registration and execution are separate controls:
- publicVisible
- masterRegistration
- copierRegistration
- testExecution
- liveExecution
- maintenance

## Core flow
Member/Trader Account -> Trading Account -> Provider/Strategy -> Copy Relationship -> Risk Engine -> Execution Adapter -> Broker/Platform -> Execution Record

The execution adapter is the integration boundary. The member/admin platform is built now; a broker-specific live execution engine can be attached later without rebuilding the surrounding product.

## Roles
- Master/Provider: publishes an eligible strategy/account and its fee/risk policy.
- Copier: connects an eligible trading account, selects a provider and sets allocation/risk controls.
- Admin: configures availability, providers, billing, risk policies and monitoring.
- Copy Trading Tester: private authorized tester role.

## Safety separation
A test execution switch and live execution switch are independent. A module can be visible to testers while live execution remains OFF.
