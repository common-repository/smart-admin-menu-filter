<?php

namespace SmartAdminMenuFilter;

/**
 * Class SmartAdminMenuFilter
 *
 * @package SmartAdminMenuFilter
 */
class SmartAdminMenuFilter {

	/**
	 * @var  null $instance Holds an instance of the object.
	 */
	private static $instance = null;


	/**
	 * AdminMenuFilterAdmin constructor.
	 */
	private function __construct() {

		// Add options settings menu link to plugins page.
		add_filter( 'plugin_action_links_' . SMART_ADMIN_MENU_FILTER_PLUGIN_BASENAME, array( $this, 'settings_link' ) );

		// Register Settings.
		register_setting( 'smart_admin_menu_filter_options', 'enable_smart_admin_menu_filter' );

		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_scripts' ) );
		add_action( 'admin_menu', array( $this, 'options_page' ) );
	}

	/**
	 * Admin init.
	 *
	 * @return  object  Returns and instance of the running object.
	 */
	public static function admin_init() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self;
		}

		return self::$instance;
	}

	/**
	 * Enqueue Scripts
	 */
	public static function enqueue_admin_scripts() {

		// Bail if the filter is disabled.
		$enabled = get_option( 'enable_smart_admin_menu_filter' );
		if ( 'on' !== $enabled ) {
			return;
		}

		$js_dist_path  = 'dist/js/smart-admin-menu-filter.min.js';
		$css_dist_path = 'dist/styles/smart-admin-menu-filter.css';

		wp_enqueue_script(
			'smart-admin-menu-filter-js',
			SMART_ADMIN_MENU_FILTER_PLUGIN_URL . $js_dist_path,
			'',
			filemtime( SMART_ADMIN_MENU_FILTER_PLUGIN_DIR . $js_dist_path ),
			true
		);

		wp_enqueue_style(
			'smart-admin-menu-filter',
			SMART_ADMIN_MENU_FILTER_PLUGIN_URL . $css_dist_path,
			filemtime( SMART_ADMIN_MENU_FILTER_PLUGIN_DIR . $css_dist_path ),
			true
		);
	}

	/**
	 * Add options menu page.
	 */
	public function options_page() {
		add_menu_page(
			'Smart Admin Menu Filter Settings',
			'Menu Filter',
			'manage_options',
			'smart-admin-menu-filter',
			array( $this, 'settings_page_html' ),
			'data:image/svg+xml;base64,' . base64_encode( '<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="-80 -50 400 450"><defs><style>.cls-1{fill:#a8aaad;}</style></defs><rect class="cls-1" x="44.06" width="163.4" height="19.46"/><rect class="cls-1" x="44.06" y="37.5" width="135.83" height="11.67"/><rect class="cls-1" x="44.06" y="67.21" width="96.03" height="11.84"/><polygon class="cls-1" points="0 106.65 251.93 106.65 164.14 234.28 163.95 290.76 89.67 361.32 88.08 240.35 0 106.65"/><polygon class="cls-1" points="28.12 97.1 28.12 0 44.06 0 44.04 97.1 28.12 97.1"/><rect class="cls-1" x="207.46" width="16.45" height="97.1"/></svg>' ),
			null
		);
	}

	/**
	 * Settings link.
	 *
	 * @param array $links Current links.
	 *
	 * @return array Admin options / settings link on plugins page.
	 */
	public function settings_link( $links ) {
		$links[] = '<a href="' . esc_url( get_admin_url( null, 'admin.php?page=smart-admin-menu-filter' ) ) . '">' . __( 'Settings', 'smart-admin-menu-filter' ) . '</a>';

		return $links;
	}

	/**
	 * Settings page.
	 */
	public function settings_page_html() {
		$enable_admin_menu_filter = get_option( 'enable_smart_admin_menu_filter' );
		ob_start();
		?>
		<div class="wrap">
			<h1><?php echo esc_html( get_admin_page_title() ); ?></h1>
			<form action="options.php" method="post">
				<h3>Smart Filtering</h3>
				<div>
					<input name='enable_smart_admin_menu_filter' type="checkbox" <?php echo( 'on' === $enable_admin_menu_filter ? 'checked' : '' ); ?> />
					<label for='enable_smart_admin_menu_filter'>Enable Admin Menu Filter</label>
				</div>
				<?php
				settings_fields( 'smart_admin_menu_filter_options' );
				do_settings_sections( 'smart_admin_menu_filter' );
				submit_button( __( 'Save Settings', 'smart-admin-menu-filter' ) );
				?>
			</form>
		</div>
		<?php
		echo ob_get_clean();
	}

	/**
	 * Activation of plugin actions.
	 *
	 * @return mixed|void
	 */
	public static function activation() {
		// restrict plugin to admins
		// you can add other restrictions here.
		if (
			! is_admin() ||
			! current_user_can( 'activate_plugins' )
		) {
			return;
		}
		add_option( 'enable_smart_admin_menu_filter', 'on' );
		update_option( 'enable_smart_admin_menu_filter', 'on' );

		$plugin = isset( $_REQUEST['plugin'] ) ? $_REQUEST['plugin'] : '';
		check_admin_referer( "activate-plugin_{$plugin}" );
	}

	/**
	 * Deactivation actions.
	 *
	 * @return mixed|void
	 */
	public static function deactivation() {
		if (
			! is_admin() ||
			! current_user_can( 'activate_plugins' )
		) {
			return;
		}
	}

	/**
	 * Uninstall actions.
	 *
	 * @return mixed|void the uninstaller script
	 */
	public static function uninstall() {
		if (
			! is_admin() ||
			! current_user_can( 'activate_plugins' )
		) {
			return;
		}

		check_admin_referer( 'bulk-plugins' );

		// Important: Check if the file is the one
		// that was registered during the uninstall hook.
		if ( __FILE__ !== WP_UNINSTALL_PLUGIN ) {
			return;
		}

		if ( function_exists( 'samf_fs' ) ) {
			samf_fs()->add_action( 'after_uninstall', 'samf_fs_uninstall_cleanup' );
		}
	}
}
