import React from 'react';

// Available block definitions
export const availableBlocks = [
  {
    id: 'text',
    label: 'Text',
    icon: React.createElement('svg', {
      className: 'block-icon',
      viewBox: '0 0 20 20',
      fill: 'currentColor',
    }, React.createElement('path', {
      d: 'M2 6h16v2H2V6zm0 4h16v2H2v-2zm0 4h10v2H2v-2z',
    })),
    component: {
      type: 'text',
      content: 'Click to edit text',
      styles: {
        fontSize: '16px',
        color: '#333333',
        padding: '10px',
        lineHeight: '1.5',
        marginBottom: '15px',
      },
      attributes: {},
    },
  },
  {
    id: 'heading',
    label: 'Heading',
    icon: React.createElement('svg', {
      className: 'block-icon',
      viewBox: '0 0 20 20',
      fill: 'currentColor',
    }, React.createElement('path', {
      d: 'M2 4h4v2H2V4zm0 4h4v2H2V8zm0 4h4v2H2v-2zm8-8h8v2h-8V4zm0 4h6v2h-6V8zm0 4h8v2h-8v-2z',
    })),
    component: {
      type: 'text',
      content: 'Your Heading Here',
      styles: {
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#333333',
        padding: '10px',
        lineHeight: '1.2',
        marginBottom: '15px',
      },
      attributes: {},
    },
  },
  {
    id: 'image',
    label: 'Image',
    icon: React.createElement('svg', {
      className: 'block-icon',
      viewBox: '0 0 20 20',
      fill: 'currentColor',
    }, React.createElement('path', {
      d: 'M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z',
    })),
    component: {
      type: 'image',
      content: '',
      styles: {
        width: '100%',
        maxWidth: '300px',
        height: 'auto',
        display: 'block',
        marginBottom: '15px',
      },
      attributes: {
        src: 'https://via.placeholder.com/300x200?text=Image',
        alt: 'Image',
      },
    },
  },
  {
    id: 'button',
    label: 'Button',
    icon: React.createElement('svg', {
      className: 'block-icon',
      viewBox: '0 0 20 20',
      fill: 'currentColor',
    }, React.createElement('rect', {
      x: '2',
      y: '6',
      width: '16',
      height: '8',
      rx: '2',
      fill: 'currentColor',
    })),
    component: {
      type: 'button',
      content: 'Click me',
      styles: {
        backgroundColor: '#3b82f6',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '6px',
        border: 'none',
        fontSize: '16px',
        cursor: 'pointer',
        textDecoration: 'none',
        display: 'inline-block',
        marginBottom: '15px',
      },
      attributes: {
        href: '#',
      },
    },
  },
  // {
  //   id: 'divider',
  //   label: 'Divider',
  //   icon: React.createElement('svg', {
  //     className: 'block-icon',
  //     viewBox: '0 0 20 20',
  //     fill: 'currentColor',
  //   }, React.createElement('path', {
  //     d: 'M2 10h16v1H2v-1z',
  //   })),
  //   component: {
  //     type: 'text',
  //     content: 's',
  //     styles: {
  //       borderTop: '1px solid #e5e7eb',
  //       margin: '20px 0',
  //       height: '1px',
  //       minWidth: '100%'
  //     },
  //     attributes: {},
  //   },
  // },
  {
    id: 'divider',
    label: 'Divider',
    icon: React.createElement('svg', {
      className: 'block-icon',
      viewBox: '0 0 20 20',
      fill: 'currentColor',
    }, React.createElement('path', {
      d: 'M2 10h16v1H2v-1z',
    })),
    component: {
      type: 'divider',
      content: '',
      styles: {
        borderTop: '1px dotted #e5e7eb',
        margin: '20px 0',
        height: '0',
        width: '100%',
        backgroundColor: 'transparent',
        display: 'block',
      },
      attributes: {},
    },
  },
  {
    id: 'spacer',
    label: 'Spacer',
    icon: React.createElement('svg', {
      className: 'block-icon',
      viewBox: '0 0 20 20',
      fill: 'currentColor',
    }, [
      React.createElement('path', {
        key: '1',
        d: 'M2 8h16v4H2V8z',
        fillOpacity: '0.3',
      }),
      React.createElement('path', {
        key: '2',
        d: 'M6 9h8v2H6V9z',
      }),
    ]),
    component: {
      type: 'spacer',
      content: '',
      styles: {
        height: '40px',
        backgroundColor: 'transparent',
        border: 'none',
        width: '100%',
        display: 'block',
      },
      attributes: {},
    },
  },
  {
    id: 'container',
    label: 'Container',
    icon: React.createElement('svg', {
      className: 'block-icon',
      viewBox: '0 0 20 20',
      fill: 'currentColor',
    }, [
      React.createElement('rect', {
        key: '1',
        x: '2',
        y: '4',
        width: '16',
        height: '12',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: '1',
      }),
      React.createElement('path', {
        key: '2',
        d: 'M4 6h12v8H4V6z',
        fillOpacity: '0.1',
      }),
    ]),
    component: {
      type: 'container',
      content: '',
      styles: {
        padding: '20px',
        backgroundColor: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        minHeight: '100px',
        height: 'auto',
        width: '100%',
        boxSizing: 'border-box',
      },
      attributes: {},
      children: [],
    },
  },
  {
    id: 'row',
    label: '2 Columns',
    icon: React.createElement('svg', {
      className: 'block-icon',
      viewBox: '0 0 20 20',
      fill: 'currentColor',
    }, [
      React.createElement('rect', {
        key: '1',
        x: '2',
        y: '4',
        width: '7',
        height: '12',
        fill: 'currentColor',
        fillOpacity: '0.3',
      }),
      React.createElement('rect', {
        key: '2',
        x: '11',
        y: '4',
        width: '7',
        height: '12',
        fill: 'currentColor',
        fillOpacity: '0.3',
      }),
    ]),
    component: {
      type: 'row',
      content: '',
      styles: {
        display: 'flex',
        gap: '10px',
        width: '100%',
      },
      attributes: {},
      children: [
        {
          id: '',
          type: 'column',
          content: '',
          styles: {
            flex: '1',
            padding: '10px',
            backgroundColor: '#f9fafb',
            border: '1px dashed #d1d5db',
            minHeight: '100px',
          },
          attributes: {},
        },
        {
          id: '',
          type: 'column',
          content: '',
          styles: {
            flex: '1',
            padding: '10px',
            backgroundColor: '#f9fafb',
            border: '1px dashed #d1d5db',
            minHeight: '100px',
          },
          attributes: {},
        },
      ],
    },
  },
  // Header Block
  {
    id: 'header',
    label: 'Header',
    icon: React.createElement('svg', {
      className: 'block-icon',
      viewBox: '0 0 20 20',
      fill: 'currentColor',
    }, [
      React.createElement('rect', {
        key: '1',
        x: '2',
        y: '3',
        width: '16',
        height: '4',
        fill: 'currentColor',
      }),
      React.createElement('circle', {
        key: '2',
        cx: '5',
        cy: '5',
        r: '1',
        fill: 'white',
      }),
      React.createElement('rect', {
        key: '3',
        x: '12',
        y: '4.5',
        width: '4',
        height: '1',
        fill: 'white',
      }),
    ]),
    component: {
      type: 'container',
      content: '',
      styles: {
        backgroundColor: '#1e40af',
        padding: '20px',
        color: 'white',
        textAlign: 'center',
        marginBottom: '20px',
        width: '100%',
        boxSizing: 'border-box',
      },
      attributes: {},
      children: [
        {
          id: '',
          type: 'text',
          content: "Your Company Name",
          styles: {
            color: 'white',
            textAlign: 'center',
            margin: '0',
            fontSize: '32px',
            fontweight: 'bold'
          },
          attributes: {},
        },
        {
          id: '',
          type: 'text',
          content: "Welcome to our newsletter",
          styles: {
            color: 'white',
            textAlign: 'center',
            margin: '10px 0 0 0',
            fontSize: '16px',
            opacity: '0.9',
          },
          attributes: {},
        },
      ],
    },
  },
  // Footer Block
  {
    id: 'footer',
    label: 'Footer',
    icon: React.createElement('svg', {
      className: 'block-icon',
      viewBox: '0 0 20 20',
      fill: 'currentColor',
    }, [
      React.createElement('rect', {
        key: '1',
        x: '2',
        y: '13',
        width: '16',
        height: '4',
        fill: 'currentColor',
      }),
      React.createElement('rect', {
        key: '2',
        x: '4',
        y: '14.5',
        width: '6',
        height: '1',
        fill: 'white',
      }),
      React.createElement('rect', {
        key: '3',
        x: '12',
        y: '14.5',
        width: '4',
        height: '1',
        fill: 'white',
      }),
    ]),
    component: {
      type: 'container',
      content: '',
      styles: {
        backgroundColor: '#374151',
        padding: '20px',
        color: 'white',
        textAlign: 'center',
        marginTop: '20px',
        fontSize: '14px',
        width: '100%',
        boxSizing: 'border-box',
      },
      attributes: {},
      children: [
        {
          id: '',
          type: 'text',
          content: "© 2025 Your Company Name. All rights reserved.",
          styles: {
            color: 'white',
            textAlign: 'center',
            fontSize: '14px',
            margin: "0 0 10px 0",
          },
          attributes: {},
        },
        {
          id: '',
          type: 'text',
          content: "123 Main Street, City, State 12345 | contact@yourcompany.com",
          styles: {
            color: 'white',
            textAlign: 'center',
            fontSize: '12px',
            margin: "0",
            opacity: "0.8",
          },
          attributes: {},
        },
      ],
    },
  },
  // 1/3 Section (One-Third + Two-Thirds)
  {
    id: 'section-1-3',
    label: '1/3 Section',
    icon: React.createElement('svg', {
      className: 'block-icon',
      viewBox: '0 0 20 20',
      fill: 'currentColor',
    }, [
      React.createElement('rect', {
        key: '1',
        x: '2',
        y: '4',
        width: '5',
        height: '12',
        fill: 'currentColor',
        fillOpacity: '0.4',
      }),
      React.createElement('rect', {
        key: '2',
        x: '7',
        y: '4',
        width: '9',
        height: '12',
        fill: 'currentColor',
        fillOpacity: '0.6',
      }),
    ]),
    component: {
      type: 'row',
      content: '',
      styles: {
        display: 'flex',
        gap: '15px',
        width: '100%',
      },
      attributes: {},
      children: [
        {
          id: '',
          type: 'column',
          content: '',
          styles: {
            flex: '1',
            padding: '15px',
            backgroundColor: '#f3f4f6',
            border: '1px dashed #d1d5db',
            minHeight: '120px',
          },
          attributes: {},
        },
        {
          id: '',
          type: 'column',
          content: '',
          styles: {
            flex: '2',
            padding: '15px',
            backgroundColor: '#f3f4f6',
            border: '1px dashed #d1d5db',
            minHeight: '120px',
          },
          attributes: {},
        },
      ],
    },
  },
  // 3/7 Section (Three-Sevenths + Four-Sevenths)
  {
    id: 'section-3-7',
    label: '3/7 Section',
    icon: React.createElement('svg', {
      className: 'block-icon',
      viewBox: '0 0 20 20',
      fill: 'currentColor',
    }, [
      React.createElement('rect', {
        key: '1',
        x: '2',
        y: '4',
        width: '6',
        height: '12',
        fill: 'currentColor',
        fillOpacity: '0.4',
      }),
      React.createElement('rect', {
        key: '2',
        x: '8',
        y: '4',
        width: '8',
        height: '12',
        fill: 'currentColor',
        fillOpacity: '0.6',
      }),
    ]),
    component: {
      type: 'row',
      content: '',
      styles: {
        display: 'flex',
        gap: '15px',
        width: '100%',
      },
      attributes: {},
      children: [
        {
          id: '',
          type: 'column',
          content: '',
          styles: {
            flex: '3',
            padding: '15px',
            backgroundColor: '#f3f4f6',
            border: '1px dashed #d1d5db',
            minHeight: '120px',
          },
          attributes: {},
        },
        {
          id: '',
          type: 'column',
          content: '',
          styles: {
            flex: '4',
            padding: '15px',
            backgroundColor: '#f3f4f6',
            border: '1px dashed #d1d5db',
            minHeight: '120px',
          },
          attributes: {},
        },
      ],
    },
  },
  // Quote Block
  {
    id: 'quote',
    label: 'Quote',
    icon: React.createElement('svg', {
      className: 'block-icon',
      viewBox: '0 0 20 20',
      fill: 'currentColor',
    }, [
      React.createElement('path', {
        key: '1',
        d: 'M3 6c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm0 8c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm10-8c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm0 8c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2z',
      }),
      React.createElement('rect', {
        key: '2',
        x: '3',
        y: '9',
        width: '14',
        height: '2',
        fill: 'currentColor',
        fillOpacity: '0.3',
      }),
    ]),
    component: {
      type: 'container',
      content: '',
      styles: {
        borderLeft: '4px solid #3b82f6',
        backgroundColor: '#f8fafc',
        padding: '20px',
        margin: '20px 0',
        fontStyle: 'italic',
      },
      attributes: {},
      children: [
        {
          id: '',
          type: 'text',
          content: '"This is an inspiring quote that adds credibility and engagement to your email content."',
          styles: {
            fontSize: '18px',
            fontStyle: 'italic',
            color: '#1f2937',
            lineHeight: '1.6',
            margin: '0 0 10px 0',
          },
          attributes: {},
        },
        {
          id: '',
          type: 'text',
          content: '— Author Name',
          styles: {
            fontSize: '14px',
            color: '#6b7280',
            fontWeight: 'bold',
            textAlign: 'right',
            margin: '0',
          },
          attributes: {},
        },
      ],
    },
  },
  // List Items Block
  // {
  //   id: 'list',
  //   label: 'List Items',
  //   icon: React.createElement('svg', {
  //     className: 'block-icon',
  //     viewBox: '0 0 20 20',
  //     fill: 'currentColor',
  //   }, [
  //    React.createElement('circle', {
  //       key: '1',
  //       cx: '4',
  //       cy: '6',
  //       r: '1',
  //       fill: 'currentColor'
  //     }),
  //     React.createElement('circle', {
  //       key: '2',
  //       cx: '4',
  //       cy: '10',
  //       r: '1',
  //       fill: 'currentColor'
  //     }),
  //     React.createElement('circle', {
  //       key: '3',
  //       cx: '4',
  //       cy: '14',
  //       r: '1',
  //       fill: 'currentColor'
  //     }),
  //     React.createElement('rect', {
  //       key: '4',
  //       x: '7',
  //       y: '5.5',
  //       width: '10',
  //       height: '1',
  //       fill: 'currentColor'
  //     }),
  //     React.createElement('rect', {
  //       key: '5',
  //       x: '7',
  //       y: '9.5',
  //       width: '8',
  //       height: '1',
  //       fill: 'currentColor'
  //     }),
  //     React.createElement('rect', {
  //       key: '6',
  //       x: '7',
  //       y: '13.5',
  //       width: '9',
  //       height: '1',
  //       fill: 'currentColor'
  //     })
  //   ]),
  //   component: {
  //     type: 'text',
  //     content: '<ul style="margin: 0; padding-left: 20px; line-height: 1.8;"><li style="margin-bottom: 8px;">First important point or feature</li><li style="margin-bottom: 8px;">Second key benefit or advantage</li><li style="margin-bottom: 8px;">Third compelling reason or detail</li><li style="margin-bottom: 0;">Final call-to-action item</li></ul>',
  //     styles: {
  //       fontSize: '16px',
  //       color: '#374151',
  //       padding: '15px',
  //       backgroundColor: '#ffffff',
  //       border: '1px solid #e5e7eb',
  //       borderRadius: '8px',
  //     },
  //     attributes: {},
  //   },
  // },
{
  "id": "list",
  "label": "List Items",
  "icon": React.createElement('svg', {
    className: 'block-icon',
    viewBox: '0 0 20 20',
    fill: 'currentColor'
  }, [
    React.createElement('circle', {
      key: '1',
      cx: '4',
      cy: '6',
      r: '1',
      fill: 'currentColor'
    }),
    React.createElement('circle', {
      key: '2',
      cx: '4',
      cy: '10',
      r: '1',
      fill: 'currentColor'
    }),
    React.createElement('circle', {
      key: '3',
      cx: '4',
      cy: '14',
      r: '1',
      fill: 'currentColor'
    }),
    React.createElement('rect', {
      key: '4',
      x: '7',
      y: '5.5',
      width: '10',
      height: '1',
      fill: 'currentColor'
    }),
    React.createElement('rect', {
      key: '5',
      x: '7',
      y: '9.5',
      width: '8',
      height: '1',
      fill: 'currentColor'
    }),
    React.createElement('rect', {
      key: '6',
      x: '7',
      y: '13.5',
      width: '9',
      height: '1',
      fill: 'currentColor'
    })
  ]),
  "component": {
    "type": "container",
    "content": "",
    "styles": {
      "padding": "15px",
      "backgroundColor": "#ffffff",
      "border": "1px solid #e5e7eb",
      "borderRadius": "8px",
      "width": "100%",
      "height": "auto"
    },
    "attributes": {
      "listType": "unordered"
    },
    "children": [
      {
        "id": "",
        "type": "text",
        "content": "First important point or feature",
        "styles": {
          "margin": "0",
          "fontSize": "16px",
          "color": "#333333",
          "lineHeight": "1.6",
          "listStyleType": "disc",
          "margin-left": "20px",
          "marginBottom": "8px"
        },
        "attributes": {}
      },
      {
        "id": "",
        "type": "text",
        "content": "Second key benefit or advantage",
        "styles": {
          "margin": "0",
          "fontSize": "16px",
          "color": "#333333",
          "lineHeight": "1.6",
          "listStyleType": "disc",
          "margin-left": "20px",
          "marginBottom": "8px"
        },
        "attributes": {}
      },
      {
        "id": "",
        "type": "text",
        "content": "Third compelling reason or detail",
        "styles": {
          "margin": "0",
          "fontSize": "16px",
          "color": "#333333",
          "lineHeight": "1.6",
          "listStyleType": "disc",
          "margin-left": "20px",
          "marginBottom": "8px"
        },
        "attributes": {}
      },
      {
        "id": "",
        "type": "text",
        "content": "Final call-to-action item",
        "styles": {
          "margin": "0",
          "fontSize": "16px",
          "color": "#333333",
          "lineHeight": "1.6",
          "listStyleType": "disc",
          "margin-left": "20px",
          "marginBottom": "0"
        },
        "attributes": {}
      }
    ]
  }
},
];