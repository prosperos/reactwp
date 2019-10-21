<?php

namespace WPGraphQL\Extensions\Polylang;

class MenuItem
{
    /**
     * Convert menu location to match the one generated by Polylang
     *
     * Ex. TOP_MENU -> TOP_MENU___fi
     */
    static function translate_menu_location(
        string $location,
        string $language
    ): string {
        $language = strtolower($language);
        return "${location}___${language}";
    }

    function init()
    {
        $this->create_nav_menu_locations();

        add_action('graphql_register_types', [$this, 'register_fields'], 10, 0);

        // XXX This is not supported by WPGraphQL yet
        add_filter(
            'graphql_menu_item_connection_args',
            [$this, 'map_input_language_to_location'],
            10,
            1
        );
    }

    function map_input_language_to_location(array $args)
    {
        if (!isset($args['where']['language'])) {
            return $args;
        }

        if (!isset($args['where']['location'])) {
            return $args;
        }

        // Required only when using other than the default language because the
        // menu location for the default language is the original location
        if (pll_default_language('slug') !== $args['where']['language']) {
            $args['where']['location'] = self::translate_menu_location(
                $args['where']['location'],
                $args['where']['language']
            );
        }

        unset($args['where']['language']);

        return $args;
    }

    /**
     * Nav menu locations are created on admin_init with PLL_Admin but GraphQL
     * requests do not call so we must manually call it
     */
    function create_nav_menu_locations()
    {
        // graphql_init is bit early. Delay to wp_loaded so the nav_menu object is avalable
        add_action(
            'wp_loaded',
            function () {
                global $polylang;

                if (
                    property_exists($polylang, 'nav_menu') &&
                    $polylang->nav_menu
                ) {
                    $polylang->nav_menu->create_nav_menu_locations();
                }
            },
            50
        );
    }

    function register_fields()
    {
        register_graphql_fields('RootQueryToMenuItemConnectionWhereArgs', [
            'language' => [
                'type' => 'LanguageCodeFilterEnum',
                'description' => '',
            ],
        ]);
    }
}
