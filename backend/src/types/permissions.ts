export enum Permission {
  // Athletes
  ATHLETE_VIEW = 'athlete.view',
  ATHLETE_CREATE = 'athlete.create',
  ATHLETE_UPDATE = 'athlete.update',
  ATHLETE_DELETE = 'athlete.delete',
  ATHLETE_EXPORT = 'athlete.export',
  
  // Teams
  TEAM_VIEW = 'team.view',
  TEAM_CREATE = 'team.create',
  TEAM_UPDATE = 'team.update',
  TEAM_DELETE = 'team.delete',
  TEAM_MANAGE_ROSTER = 'team.manage_roster',
  
  // Matches
  MATCH_VIEW = 'match.view',
  MATCH_CREATE = 'match.create',
  MATCH_UPDATE = 'match.update',
  MATCH_DELETE = 'match.delete',
  MATCH_MANAGE_ROSTER = 'match.manage_roster',
  MATCH_UPDATE_RESULTS = 'match.update_results',
  
  // Documents
  DOCUMENT_VIEW = 'document.view',
  DOCUMENT_UPLOAD = 'document.upload',
  DOCUMENT_DELETE = 'document.delete',
  DOCUMENT_DOWNLOAD = 'document.download',
  
  // Payments
  PAYMENT_VIEW = 'payment.view',
  PAYMENT_CREATE = 'payment.create',
  PAYMENT_UPDATE = 'payment.update',
  PAYMENT_RECORD = 'payment.record',
  PAYMENT_EXPORT = 'payment.export',
  
  // Transport
  TRANSPORT_VIEW = 'transport.view',
  TRANSPORT_MANAGE = 'transport.manage',
  
  // Reports
  REPORT_VIEW = 'report.view',
  REPORT_EXPORT = 'report.export',
  REPORT_FINANCIAL = 'report.financial',
  
  // Notifications
  NOTIFICATION_SEND = 'notification.send',
  NOTIFICATION_MANAGE = 'notification.manage',
  
  // Organization
  ORG_SETTINGS_VIEW = 'org.settings.view',
  ORG_SETTINGS_UPDATE = 'org.settings.update',
  ORG_BILLING_VIEW = 'org.billing.view',
  ORG_BILLING_UPDATE = 'org.billing.update',
  
  // Users
  USER_VIEW = 'user.view',
  USER_CREATE = 'user.create',
  USER_UPDATE = 'user.update',
  USER_DELETE = 'user.delete',
  USER_INVITE = 'user.invite',
  
  // Roles
  ROLE_VIEW = 'role.view',
  ROLE_CREATE = 'role.create',
  ROLE_UPDATE = 'role.update',
  ROLE_DELETE = 'role.delete',
  
  // System
  SYSTEM_AUDIT_VIEW = 'system.audit.view',
  SYSTEM_BACKUP = 'system.backup',
  
  // Super permissions
  ALL = '*'
}

export interface RoleTemplate {
  name: string;
  description: string;
  permissions: Permission[];
}

export const DEFAULT_ROLES: RoleTemplate[] = [
  {
    name: 'Admin',
    description: 'Full access to organization',
    permissions: [Permission.ALL]
  },
  {
    name: 'Manager',
    description: 'Manage teams, athletes and matches',
    permissions: [
      Permission.ATHLETE_VIEW,
      Permission.ATHLETE_CREATE,
      Permission.ATHLETE_UPDATE,
      Permission.ATHLETE_DELETE,
      Permission.ATHLETE_EXPORT,
      Permission.TEAM_VIEW,
      Permission.TEAM_CREATE,
      Permission.TEAM_UPDATE,
      Permission.TEAM_DELETE,
      Permission.TEAM_MANAGE_ROSTER,
      Permission.MATCH_VIEW,
      Permission.MATCH_CREATE,
      Permission.MATCH_UPDATE,
      Permission.MATCH_DELETE,
      Permission.MATCH_MANAGE_ROSTER,
      Permission.MATCH_UPDATE_RESULTS,
      Permission.DOCUMENT_VIEW,
      Permission.DOCUMENT_UPLOAD,
      Permission.DOCUMENT_DELETE,
      Permission.PAYMENT_VIEW,
      Permission.PAYMENT_CREATE,
      Permission.PAYMENT_UPDATE,
      Permission.TRANSPORT_VIEW,
      Permission.TRANSPORT_MANAGE,
      Permission.REPORT_VIEW,
      Permission.REPORT_EXPORT,
      Permission.NOTIFICATION_SEND,
      Permission.USER_VIEW,
      Permission.USER_INVITE
    ]
  },
  {
    name: 'Coach',
    description: 'Manage teams and view athletes',
    permissions: [
      Permission.ATHLETE_VIEW,
      Permission.TEAM_VIEW,
      Permission.TEAM_MANAGE_ROSTER,
      Permission.MATCH_VIEW,
      Permission.MATCH_MANAGE_ROSTER,
      Permission.MATCH_UPDATE_RESULTS,
      Permission.DOCUMENT_VIEW,
      Permission.TRANSPORT_VIEW,
      Permission.REPORT_VIEW
    ]
  },
  {
    name: 'Staff',
    description: 'View and basic operations',
    permissions: [
      Permission.ATHLETE_VIEW,
      Permission.TEAM_VIEW,
      Permission.MATCH_VIEW,
      Permission.DOCUMENT_VIEW,
      Permission.DOCUMENT_UPLOAD,
      Permission.PAYMENT_VIEW,
      Permission.PAYMENT_RECORD,
      Permission.TRANSPORT_VIEW,
      Permission.REPORT_VIEW
    ]
  },
  {
    name: 'Parent',
    description: 'View own athlete data',
    permissions: [
      Permission.ATHLETE_VIEW, // Limited to own athletes
      Permission.TEAM_VIEW,
      Permission.MATCH_VIEW,
      Permission.DOCUMENT_VIEW,
      Permission.PAYMENT_VIEW,
      Permission.TRANSPORT_VIEW
    ]
  },
  {
    name: 'Viewer',
    description: 'Read-only access',
    permissions: [
      Permission.ATHLETE_VIEW,
      Permission.TEAM_VIEW,
      Permission.MATCH_VIEW,
      Permission.DOCUMENT_VIEW,
      Permission.REPORT_VIEW
    ]
  }
];

export const PERMISSION_GROUPS = {
  'Athletes': [
    Permission.ATHLETE_VIEW,
    Permission.ATHLETE_CREATE,
    Permission.ATHLETE_UPDATE,
    Permission.ATHLETE_DELETE,
    Permission.ATHLETE_EXPORT
  ],
  'Teams': [
    Permission.TEAM_VIEW,
    Permission.TEAM_CREATE,
    Permission.TEAM_UPDATE,
    Permission.TEAM_DELETE,
    Permission.TEAM_MANAGE_ROSTER
  ],
  'Matches': [
    Permission.MATCH_VIEW,
    Permission.MATCH_CREATE,
    Permission.MATCH_UPDATE,
    Permission.MATCH_DELETE,
    Permission.MATCH_MANAGE_ROSTER,
    Permission.MATCH_UPDATE_RESULTS
  ],
  'Documents': [
    Permission.DOCUMENT_VIEW,
    Permission.DOCUMENT_UPLOAD,
    Permission.DOCUMENT_DELETE,
    Permission.DOCUMENT_DOWNLOAD
  ],
  'Payments': [
    Permission.PAYMENT_VIEW,
    Permission.PAYMENT_CREATE,
    Permission.PAYMENT_UPDATE,
    Permission.PAYMENT_RECORD,
    Permission.PAYMENT_EXPORT
  ],
  'Transport': [
    Permission.TRANSPORT_VIEW,
    Permission.TRANSPORT_MANAGE
  ],
  'Reports': [
    Permission.REPORT_VIEW,
    Permission.REPORT_EXPORT,
    Permission.REPORT_FINANCIAL
  ],
  'Users & Roles': [
    Permission.USER_VIEW,
    Permission.USER_CREATE,
    Permission.USER_UPDATE,
    Permission.USER_DELETE,
    Permission.USER_INVITE,
    Permission.ROLE_VIEW,
    Permission.ROLE_CREATE,
    Permission.ROLE_UPDATE,
    Permission.ROLE_DELETE
  ],
  'Organization': [
    Permission.ORG_SETTINGS_VIEW,
    Permission.ORG_SETTINGS_UPDATE,
    Permission.ORG_BILLING_VIEW,
    Permission.ORG_BILLING_UPDATE,
    Permission.NOTIFICATION_SEND,
    Permission.NOTIFICATION_MANAGE
  ],
  'System': [
    Permission.SYSTEM_AUDIT_VIEW,
    Permission.SYSTEM_BACKUP
  ]
};
