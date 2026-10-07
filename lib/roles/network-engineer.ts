import type { Role } from './types'

export const NETWORK_ENGINEER: Role = {
  slug: 'network-engineer',
  title: 'Network Engineer',
  blurb: 'Designs, secures and troubleshoots the networks that connect offices, data centers and cloud workloads.',
  asOf: '2026-10',
  demand: [],
  scenario: {
    title: 'Connecting a new branch office to headquarters and the cloud',
    story:
      'A company opens a 40-person branch office that needs access to internal apps at headquarters and to workloads in a cloud VPC. You design the addressing, set up the switches, wireless and secure tunnels, and make sure you can see and fix problems quickly.',
  },
  steps: [
    { stackId: 'fundamentals', label: 'Plan addressing', happens: 'Choose non-overlapping subnets and VLANs for staff, guests and printers, with room to grow.' },
    { stackId: 'switching', label: 'Build the LAN', happens: 'Configure access switches with VLANs, trunk links to the uplink and spanning tree protection.' },
    { stackId: 'routing', label: 'Route traffic', happens: 'Set up the branch router with OSPF or static routes toward headquarters and BGP toward the internet or cloud provider.' },
    { stackId: 'security', label: 'Secure the edge', happens: 'Apply firewall rules between VLANs, build an IPsec VPN to headquarters and the cloud and require MFA for remote access.' },
    { stackId: 'cloud', label: 'Reach the cloud', happens: 'Connect the branch to a cloud VPC through a VPN gateway, with route tables and security groups limiting access.' },
    { stackId: 'ops', label: 'Monitor and automate', happens: 'Collect interface, latency and flow data, back up configs and use scripts to push the same change to every site.' },
  ],
  stack: [
    {
      id: 'fundamentals', name: 'TCP/IP, addressing and DNS',
      what: 'How devices get addresses, find each other and send traffic, including subnets, DHCP and DNS.',
      why: 'Every design and every outage investigation starts from these basics.',
      mustKnow: ['Subnetting and CIDR notation', 'The difference between layer 2 and layer 3 and where each fails', 'How DNS and DHCP failures look to users'],
      mistake: 'Picking a branch subnet that overlaps with headquarters and discovering it when the tunnel comes up.',
    },
    {
      id: 'switching', name: 'Switching, VLANs and Wi-Fi',
      what: 'Layer 2 switches that segment a LAN with VLANs, plus wireless access points that join the same network.',
      why: 'Separating staff, guests and devices limits the damage from one compromised machine.',
      mustKnow: ['Access versus trunk ports and the native VLAN', 'Spanning tree and why loops take a network down', 'Wi-Fi channel planning and WPA3 or 802.1X for staff'],
      mistake: 'Leaving unused ports enabled in the staff VLAN where anyone can plug in.',
    },
    {
      id: 'routing', name: 'Routing (static, OSPF and BGP)',
      what: 'How routers learn where to send packets, inside a company with OSPF and between networks with BGP.',
      why: 'The branch needs a reliable path to headquarters and out to the internet, with a backup if a link fails.',
      mustKnow: ['Longest-prefix match and how the routing table decides', 'OSPF areas and adjacency basics', 'BGP basics: prefixes, AS paths and filtering what you accept'],
      mistake: 'Advertising or accepting routes without filters so a typo changes where traffic flows.',
    },
    {
      id: 'security', name: 'Firewalls, VPN and zero trust access',
      what: 'Devices and policies that control which traffic is allowed, with IPsec or WireGuard tunnels between sites.',
      why: 'The branch links to internal systems, so access must be limited to what each group actually needs.',
      mustKnow: ['Default deny and rules written by source, destination and port', 'IPsec tunnel phases and common mismatch causes', 'Log rule hits so you can remove unused rules'],
      mistake: 'Adding an any-to-any rule to get something working and never removing it.',
    },
    {
      id: 'cloud', name: 'Cloud networking (VPC, VPN and peering)',
      what: 'Virtual networks in AWS, Azure or Google Cloud, with route tables, security groups and VPN or dedicated links to on-premises sites.',
      why: 'Workloads moved to the cloud still need private, controlled connections back to offices.',
      mustKnow: ['VPC subnets, route tables and gateways', 'Security groups versus network ACLs', 'Plan CIDR ranges so cloud and on-premises never overlap'],
      mistake: 'Opening a security group to the whole internet during testing and forgetting to close it.',
    },
    {
      id: 'ops', name: 'Monitoring, troubleshooting and automation',
      what: 'SNMP, telemetry and flow data for visibility, packet tools for diagnosis and Python or Ansible for repeatable changes.',
      why: 'You find problems from graphs before users call, and automation keeps many sites consistent.',
      mustKnow: ['Work up the layers when troubleshooting: link, address, route, port', 'Use ping, traceroute and packet captures and read their output', 'Back up configs and test changes before applying them everywhere'],
      mistake: 'Making changes by hand on each device so no two sites match.',
    },
  ],
}
