const mongoose = require("mongoose");

// ========================================
// PERMISSION SCHEMA
// ========================================

const permissionSchema = new mongoose.Schema(
  {
    // ========================================
    // DASHBOARD
    // ========================================

    dashboard: {
      view: {
        type: Boolean,
        default: false,
      },
    },

    // ========================================
    // USERS
    // ========================================

    users: {
      view: {
        type: Boolean,
        default: false,
      },

      add: {
        type: Boolean,
        default: false,
      },

      update: {
        type: Boolean,
        default: false,
      },

      changeStatus: {
        type: Boolean,
        default: false,
      },
    },

    // ========================================
    // ASSETS
    // ========================================

    assets: {
      view: {
        type: Boolean,
        default: false,
      },

      add: {
        type: Boolean,
        default: false,
      },

      addExisting: {
        type: Boolean,
        default: false,
      },

      update: {
        type: Boolean,
        default: false,
      },
    },

    // ========================================
    // ASSET REQUESTS
    // ========================================

    assetRequests: {
      view: {
        type: Boolean,
        default: false,
      },

      create: {
        type: Boolean,
        default: false,
      },

      approve: {
        type: Boolean,
        default: false,
      },
    },

    // ========================================
    // ASSET OPERATIONS
    // ========================================

    assetOperations: {
      assignment: {
        type: Boolean,
        default: false,
      },

      transfer: {
        type: Boolean,
        default: false,
      },

      return: {
        type: Boolean,
        default: false,
      },

      disposal: {
        type: Boolean,
        default: false,
      },
    },

    // ========================================
    // REPAIRS
    // ========================================

    repairs: {
      view: {
        type: Boolean,
        default: false,
      },

      create: {
        type: Boolean,
        default: false,
      },

      approve: {
        type: Boolean,
        default: false,
      },

      reject: {
        type: Boolean,
        default: false,
      },

      update: {
        type: Boolean,
        default: false,
      },
    },

    // ========================================
    // ASSET AUTHORIZATION
    // ========================================

    assetAuthorization: {
      view: {
        type: Boolean,
        default: false,
      },

      approve: {
        type: Boolean,
        default: false,
      },
    },

    // ========================================
    // VERIFICATION MAPPING
    // ========================================

    verificationMapping: {
      view: {
        type: Boolean,
        default: false,
      },

      submit: {
        type: Boolean,
        default: false,
      },

      approve: {
        type: Boolean,
        default: false,
      },

      history: {
        type: Boolean,
        default: false,
      },
    },

    // ========================================
    // OUTLETS
    // ========================================

    outlets: {
      view: {
        type: Boolean,
        default: false,
      },

      add: {
        type: Boolean,
        default: false,
      },

      update: {
        type: Boolean,
        default: false,
      },
    },

    // ========================================
    // CHECK-IN
    // ========================================

    checkIns: {
      checkIn: {
        type: Boolean,
        default: false,
      },

      history: {
        type: Boolean,
        default: false,
      },

      allHistory: {
        type: Boolean,
        default: false,
      },
    },

    // ========================================
    // REGIONS
    // ========================================

    regions: {
      view: {
        type: Boolean,
        default: false,
      },

      add: {
        type: Boolean,
        default: false,
      },

      update: {
        type: Boolean,
        default: false,
      },
    },

    // ========================================
    // DISTRICTS
    // ========================================

    districts: {
      view: {
        type: Boolean,
        default: false,
      },

      add: {
        type: Boolean,
        default: false,
      },

      update: {
        type: Boolean,
        default: false,
      },
    },

    // ========================================
    // DISTRIBUTORS
    // ========================================

    distributors: {
      view: {
        type: Boolean,
        default: false,
      },

      add: {
        type: Boolean,
        default: false,
      },

      update: {
        type: Boolean,
        default: false,
      },
    },

    // ========================================
    // MANUFACTURERS
    // ========================================

    manufacturers: {
      view: {
        type: Boolean,
        default: false,
      },

      add: {
        type: Boolean,
        default: false,
      },

      update: {
        type: Boolean,
        default: false,
      },

      changeStatus: {
        type: Boolean,
        default: false,
      },
    },

    // ========================================
    // REPORTS
    // ========================================

    reports: {
      view: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    _id: false,
  },
);

// ========================================
// USER SCHEMA
// ========================================

const userSchema = new mongoose.Schema(
  {
    // ========================================
    // BASIC INFORMATION
    // ========================================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // ========================================
    // PROFILE INFORMATION
    // ========================================

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    address: {
      type: String,
      trim: true,
      default: "",
    },

    profilePicture: {
      type: String,
      trim: true,
      default: "",
    },

    // ========================================
    // PASSWORD
    // ========================================

    password: {
      type: String,
      required: true,
    },

    // ========================================
    // FORGOT PASSWORD
    // ========================================

    passwordResetToken: {
      type: String,
      default: null,
    },

    passwordResetExpires: {
      type: Date,
      default: null,
    },

    // ========================================
    // AUTHORIZATION
    // ========================================

    role: {
      type: String,
      enum: ["SYSTEM_ADMIN", "ASO", "TSO", "TSM", "TECHNICIAN"],
      required: true,
    },

    // The ASO responsible for reviewing this user's requests.
    assignedAso: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // The TSO responsible for supervising an ASO.
    assignedTso: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // The region managed by a TSM.
    region: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Region",
      default: null,
    },

    // ========================================
    // USER ACCESS RIGHTS
    // ========================================

    permissions: {
      type: permissionSchema,
      default: () => ({}),
    },

    // ========================================
    // ACCOUNT STATUS
    // ========================================

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("User", userSchema);
