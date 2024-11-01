<?php

/**
 * Plugin Name: Smart Admin Menu Filter
 * Description: Advanced phonetic menu filter plugin.
 * Version: 1.0.1
 * Author: <a href='https://wpadmin.ai'>WPAdmin.ai</a>
 * Text Domain: smart-admin-menu-filter
 * Domain Path: /languages/
 *
 * @package SmartAdminMenuFilter
 * @author  wpadmin.ai
 */
namespace SmartAdminMenuFilter;


if ( !function_exists( 'samf_fs' ) ) {
    /**
     * Freemius SDK.
     *
     * @return \Freemius
     * @throws \Freemius_Exception When Freemius errors.
     */
    function samf_fs()
    {
        global  $samf_fs ;
        
        if ( !isset( $samf_fs ) ) {
            if ( !defined( 'WP_FS__PRODUCT_8908_MULTISITE' ) ) {
                define( 'WP_FS__PRODUCT_8908_MULTISITE', true );
            }
            require_once dirname( __FILE__ ) . '/freemius/start.php';
            $samf_fs = fs_dynamic_init( array(
                'id'             => '8908',
                'slug'           => 'smart-admin-menu-filter',
                'type'           => 'plugin',
                'public_key'     => 'pk_eb593e5669f697c8a2b878f8dca70',
                'is_premium'     => false,
                'has_addons'     => false,
                'has_paid_plans' => false,
                'menu'           => array(
                'slug' => 'smart-admin-menu-filter',
            ),
                'is_live'        => true,
            ) );
        }
        
        return $samf_fs;
    }
    
    samf_fs();
    do_action( 'samf_fs_loaded' );
}

// Autoload our dependencies.
require __DIR__ . '/vendor/autoload.php';
// Disallows direct file access when core isn't loaded.
defined( 'ABSPATH' ) or exit;
define( 'SMART_ADMIN_MENU_FILTER_VERSION', '1.0' );
define( 'SMART_ADMIN_MENU_FILTER_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'SMART_ADMIN_MENU_FILTER_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'SMART_ADMIN_MENU_FILTER_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );
load_plugin_textdomain( 'smart-admin-menu-filter', false, basename( dirname( __FILE__ ) ) . '/languages' );

if ( is_admin() ) {
    // Start admin on plugins loaded.
    add_action( 'plugins_loaded', array( '\\SmartAdminMenuFilter\\SmartAdminMenuFilter', 'admin_init' ) );
    // Register activation, deactivation, and uninstall hooks.
    // register_activation_hook( __FILE__, array( '\SmartAdminMenuFilter\SmartAdminMenuFilter', 'activation' ) );
    // register_deactivation_hook( __FILE__, array( '\SmartAdminMenuFilter\SmartAdminMenuFilter', 'deactivation' ) );
    // register_deactivation_hook( __FILE__, array( '\SmartAdminMenuFilter\SmartAdminMenuFilter', 'uninstall' ) );
}
